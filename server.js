const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

const recentSubmissions = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

app.post("/api/feedback", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const feedback = typeof req.body?.feedback === "string" ? req.body.feedback.trim() : "";

    if (!message || !feedback || message.length > 3000 || feedback.length > 3000) {
      return res.status(400).json({ error: "Enter both fields (maximum 3,000 characters each)." });
    }

    // Basic per-IP rate limit to reduce spam. For large deployments, use a shared store.
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const prior = recentSubmissions.get(ip);
    if (prior && now - prior.startedAt < WINDOW_MS && prior.count >= MAX_PER_WINDOW) {
      return res.status(429).json({ error: "Too many submissions. Please try again later." });
    }
    if (!prior || now - prior.startedAt >= WINDOW_MS) {
      recentSubmissions.set(ip, { startedAt: now, count: 1 });
    } else {
      prior.count += 1;
    }

    const { RESEND_API_KEY, NOTIFY_EMAIL, EMAIL_FROM } = process.env;
    if (!RESEND_API_KEY || !NOTIFY_EMAIL || !EMAIL_FROM) {
      return res.status(503).json({ error: "Email service is not configured on the server yet." });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [NOTIFY_EMAIL],
        subject: "New website message & feedback",
        text: `A visitor submitted the form.\n\nMESSAGE:\n${message}\n\nFEEDBACK:\n${feedback}\n\nReceived: ${new Date().toISOString()}`
      })
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error("Resend delivery error:", details);
      return res.status(502).json({ error: "The email provider could not send the message." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Feedback endpoint error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Message & Feedback website listening on port ${PORT}`);
});

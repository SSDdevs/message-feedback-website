# Message & Feedback — deploy-ready project

The website has exactly two visitor fields: **Message** and **Feedback**. The server emails those submissions using Resend. It does not collect passwords.

## A. Put the project on GitHub
1. Extract this ZIP.
2. Create a new repository on GitHub (for example `message-feedback-website`).
3. Upload the files and folders from this project to the repository root. Make sure `package.json`, `server.js`, `render.yaml`, and `public/index.html` are at the root / shown as listed.

## B. Create an email sender with Resend
1. Create/sign in to a Resend account at https://resend.com.
2. Create an API key and copy it somewhere private. Do not put it in `public/index.html` or GitHub.
3. For reliable delivery to any recipient, verify a domain you own in Resend and use a sender such as `Website <forms@yourdomain.com>`.
4. If you don't own a domain yet, Resend's test sender may be restricted to your own verified account email. Check Resend's current onboarding restrictions before testing.

## C. Deploy on Render
1. Sign in at https://render.com and choose **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Use these settings:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
4. Create the service. Render will provide a public URL when deployment finishes.
5. In Render, open your service → **Environment** and add:
   - `RESEND_API_KEY` = your private Resend API key
   - `NOTIFY_EMAIL` = `gamerx300t@gmail.com`
   - `EMAIL_FROM` = a sender address verified/allowed by Resend, for example `Website <forms@yourdomain.com>`
6. Save changes and redeploy if prompted.

## D. Test
1. Open the Render public URL.
2. Fill in both fields with a harmless test message.
3. Click **Send message**.
4. Check the destination inbox and spam folder.

## Troubleshooting
- **Email service is not configured**: check all three environment variables in Render.
- **Email provider could not send**: inspect Render logs; the sender must be allowed by Resend and the API key must be valid.
- **Page says sending is not configured**: confirm you deployed this complete project, including `server.js` and `package.json`, not just `public/index.html`.
- Free hosting can sleep after inactivity, so the first request may take a little longer.

Security notes: the API key stays on the server, input lengths are limited, and a basic rate limit is included. This is a starter project; for high-traffic use, add a shared rate limiter and stronger anti-spam controls.

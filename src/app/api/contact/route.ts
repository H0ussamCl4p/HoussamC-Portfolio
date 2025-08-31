import nodemailer from 'nodemailer';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, subject, message } = data;

    if (!email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), { status: 501 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: false, // use STARTTLS on port 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const toAddress = 'choubikhoussam@gmail.com';

    const escapeHtml = (str = '') =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeName = escapeHtml(name || 'Anonymous');
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827;">
        <div style="max-width:600px;margin:24px auto;border-radius:12px;overflow:hidden;border:1px solid #e6e9ee;box-shadow:0 6px 18px rgba(17,24,39,0.06);">
          <div style="background:linear-gradient(90deg,#4aa3ff,#6ad0ff);padding:20px 24px;color:white;">
            <h2 style="margin:0;font-size:18px">New message from your portfolio</h2>
            <p style="margin:4px 0 0;font-size:13px;opacity:0.95">${safeSubject}</p>
          </div>
          <div style="background:white;padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:14px;color:#374151"><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
            <div style="padding:12px;border-radius:8px;background:#f8fafc;border:1px solid #eef2f7;color:#111827;font-size:14px;line-height:1.5;">
              ${safeMessage}
            </div>
            <p style="margin:16px 0 0;font-size:12px;color:#6b7280">This message was sent from your portfolio contact form.</p>
          </div>
          <div style="background:#fbfdff;padding:12px 24px;font-size:12px;color:#6b7280;text-align:center">You can reply to this email to respond to the sender.</div>
        </div>
      </div>
    `;

    const text = `From: ${name || 'Anonymous'} <${email}>\n\n${message}`;

    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: toAddress,
      subject: safeSubject,
      text,
      html,
      replyTo: email,
    });

    return new Response(JSON.stringify({ ok: true, info }), { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

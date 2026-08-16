// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
import nodemailer from 'nodemailer';

export interface EmailTicketPayload {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  issue: string;
  screenshot_url?: string | null;
  suggestions?: string | null;
}

export async function sendSupportTicketEmail(
  ticket: EmailTicketPayload,
  recipients?: string[]
) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'events@cev.ac.in';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM_EMAIL || `"CEV EVENTS Support" <${user}>`;

  if (!pass) {
    console.warn('SMTP_PASS is not configured. Email notification skipped.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const attachments: Array<{ filename: string; content: Buffer }> = [];

  if (ticket.screenshot_url && ticket.screenshot_url.startsWith('http')) {
    try {
      const response = await fetch(ticket.screenshot_url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExt = ticket.screenshot_url.split('.').pop()?.split('?')[0] || 'jpg';
        attachments.push({
          filename: `screenshot-proof.${fileExt}`,
          content: buffer,
        });
      }
    } catch (fetchErr) {
      console.warn('Failed to fetch screenshot for email attachment:', fetchErr);
    }
  }

  const validRecipients = recipients && recipients.length > 0 ? recipients : [user];
  const toList = Array.from(new Set(validRecipients.filter(Boolean))).join(', ');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08090d; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 22px;">🐛 New Bug Report / Support Ticket</h1>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Ticket Reference ID: <strong>${ticket.id}</strong></p>
      </div>

      <div style="background-color: #0f121d; border: 1px solid #1e2436; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h3 style="color: #ffffff; font-size: 14px; margin-top: 0; margin-bottom: 8px;">Reporter Contact Details</h3>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Name:</strong> ${ticket.name}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Email:</strong> <a href="mailto:${ticket.email}" style="color: #38bdf8; text-decoration: underline;">${ticket.email}</a></p>
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Phone:</strong> ${ticket.phone || 'Not provided'}</p>
      </div>

      <div style="background-color: #0f121d; border: 1px solid #1e2436; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h3 style="color: #f43f5e; font-size: 14px; margin-top: 0; margin-bottom: 8px;">Issue Description</h3>
        <div style="font-size: 13px; white-space: pre-wrap; line-height: 1.6; color: #e2e8f0; background: #161a29; padding: 12px; border-radius: 6px; border: 1px solid #1e2436;">${ticket.issue}</div>
      </div>

      ${ticket.suggestions ? `
      <div style="background-color: #0f121d; border: 1px solid #1e2436; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h3 style="color: #fbbf24; font-size: 14px; margin-top: 0; margin-bottom: 8px;">User Suggestions / Feedback</h3>
        <div style="font-size: 13px; white-space: pre-wrap; line-height: 1.6; color: #e2e8f0; background: #161a29; padding: 12px; border-radius: 6px; border: 1px solid #1e2436;">${ticket.suggestions}</div>
      </div>
      ` : ''}

      ${ticket.screenshot_url ? `
      <div style="background-color: #0f121d; border: 1px solid #1e2436; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h3 style="color: #38bdf8; font-size: 14px; margin-top: 0; margin-bottom: 8px;">Screenshot Proof</h3>
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">URL: <a href="${ticket.screenshot_url}" style="color: #6366f1; text-decoration: underline;" target="_blank">${ticket.screenshot_url}</a></p>
        <p style="font-size: 12px; color: #10b981; margin: 0;">✓ Image file attached to this email.</p>
      </div>
      ` : ''}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e2436; font-size: 11px; color: #64748b; text-align: center;">
        CEV EVENTS Superadmin Notification System • Automated Delivery via SMTP
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: toList,
    subject: `[CEV Bug Report] ${ticket.name}: ${ticket.issue.slice(0, 45)}...`,
    html: htmlContent,
    attachments,
  });
}

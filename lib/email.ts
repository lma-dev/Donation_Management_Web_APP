import nodemailer from "nodemailer";

const smtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

function createTransporter() {
  if (!smtpConfigured) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  password: string,
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping welcome email");
    return false;
  }

  const loginUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a; margin-bottom: 24px;">Welcome to Spring Liberation Rose</h2>
      <p style="color: #444; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color: #444; line-height: 1.6;">Your account has been created. Here are your login credentials:</p>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0; color: #333;"><strong>Email:</strong> ${to}</p>
        <p style="margin: 4px 0; color: #333;"><strong>Password:</strong> ${password}</p>
      </div>
      <p style="color: #444; line-height: 1.6;">Please change your password after your first login.</p>
      <a href="${loginUrl}" style="display: inline-block; background: #18181b; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; margin-top: 12px;">
        Sign In
      </a>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
      <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "Welcome to Spring Liberation Rose — Your Account Details",
      html,
    });
    console.log(`[email] Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[email] Failed to send welcome email to ${to}:`, error);
    return false;
  }
}

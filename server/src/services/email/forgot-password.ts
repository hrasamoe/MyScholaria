import { ENV } from "../../config/env";
// import { transporter } from "../email.service";
import { resend } from "../email.service";

function forgotPasswordTemplate(fullName: string, link: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Inter, Arial, sans-serif; background: #f7f9fc; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #1976d2; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; }
        .body p { color: #2d3748; line-height: 1.6; font-size: 15px; }
        .footer { padding: 16px 32px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .expire { background: #f7f9fc; border-radius: 8px; padding: 12px 16px; margin-top: 20px; color: #6b7280; font-size: 13px; }
        .warning { background: #fff7ed; border-radius: 8px; padding: 12px 16px; margin-top: 12px; color: #92400e; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MyScholaria</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>
          <a href="${link}"
             style="display:block;width:fit-content;margin:24px auto;background:#1976d2;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Reset my password
          </a>
          <div class="expire">
            ⏱ This link expires in <strong>1 hour</strong>.
          </div>
          <div class="warning">
            🔒 If you did not request a password reset, please ignore this email — your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} MyScholaria — All rights reserved
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendForgotPasswordEmail(
  email: string,
  fullName: string,
  token: string,
) {
  const link = `${ENV.CLIENT_URL}/auth/change-password?token=${token}`;
  try {
    const { data, error } = await resend.emails.send({
      from: "MyScholaria <no-reply@ibc-hub.me>",
      to: email,
      subject: "Reset your password - MyScholaria",
      html: forgotPasswordTemplate(fullName, link),
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    throw error;
  }
}

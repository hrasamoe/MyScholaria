import { ENV } from "../../config/env";
import { transporter } from "../email.service";

function confirmationTemplate(
  fullName: string,
  establishmentName: string,
  link: string,
) {
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
        .establishment-box { background: #edf2f7; border-left: 4px solid #1976d2; padding: 12px 16px; margin: 20px 0; border-radius: 4px; }
        .footer { padding: 16px 32px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .expire { background: #f7f9fc; border-radius: 8px; padding: 12px 16px; margin-top: 20px; color: #6b7280; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MyScholaria</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Thank you for registering <strong>${establishmentName}</strong> on <strong>MyScholaria</strong>.</p>
          <p>To finalize your account setup and start managing your establishment, please confirm your email address below:</p>
          <a href="${link}"
             style="display:block;width:fit-content;margin:24px auto;background:#1976d2;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Confirm my email
          </a>
          <div class="expire">
            ⏱ This link expires in <strong>24 hours</strong>.<br>
            If you did not initiate this registration, please ignore this email.
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

export async function sendConfirmationEmail(
  email: string,
  fullName: string,
  establishmentName: string,
  token: string,
) {
  const link = `${ENV.CLIENT_URL}/auth/verify-email?token=${token}`;
  try {
    await transporter.sendMail({
      from: `MyScholaria`,
      to: email,
      subject: `Confirm your registration: ${establishmentName} - MyScholaria`,
      html: confirmationTemplate(fullName, establishmentName, link),
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
    throw error;
  }
}

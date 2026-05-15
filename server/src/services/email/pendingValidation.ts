import { ENV } from "../../config/env";
// import { transporter } from "../email.service";
import { resend } from "../email.service";

function pendingValidationTemplate(
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
        .status-badge { display: inline-block; background: #fff3cd; color: #856404; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 13px; margin-bottom: 16px; }
        .footer { padding: 16px 32px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .info-box { background: #e7f3ff; border-radius: 8px; padding: 16px; margin-top: 20px; color: #1976d2; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MyScholaria</h1>
        </div>
        <div class="body">
          <div class="status-badge">Account Pending Approval</div>
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Your account has been successfully created for the establishment <strong>${establishmentName}</strong>.</p>
          <p><strong>Important:</strong> To ensure security, your access is currently restricted. An administrator must approve your request before you can start using the application services.</p>
          <p>Please confirm your email address first by clicking the button below:</p>
          <a href="${link}"
             style="display:block;width:fit-content;margin:24px auto;background:#1976d2;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Verify Email
          </a>
          <div class="info-box">
            Once your email is verified, the administrators of <strong>${establishmentName}</strong> will be notified to review and authorize your account.
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

export async function sendPendingValidationEmail(
  email: string,
  fullName: string,
  establishmentName: string,
  token: string,
) {
  const link = `${ENV.CLIENT_URL}/auth/verify-email-member?token=${token}`;
  try {
    const { data, error } = await resend.emails.send({
      from: "MyScholaria <no-reply@ibc-hub.me>",
      to: email,
      subject: `Action Required: Verify your account for ${establishmentName}`,
      html: pendingValidationTemplate(fullName, establishmentName, link),
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error sending pending validation email:", error);
    throw error;
  }
}

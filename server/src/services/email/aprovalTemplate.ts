import { ENV } from "../../config/env";
import { resend } from "../email.service";

function approvalTemplate(
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
        .header { background: #2e7d32; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; }
        .body p { color: #2d3748; line-height: 1.6; font-size: 15px; }
        .establishment-box { background: #edf2f7; border-left: 4px solid #2e7d32; padding: 12px 16px; margin: 20px 0; border-radius: 4px; }
        .footer { padding: 16px 32px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .info-box { background: #edf7ed; border-radius: 8px; padding: 12px 16px; margin-top: 20px; color: #1e4620; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MyScholaria</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>We are pleased to inform you that your admission to <strong>${establishmentName}</strong> has been approved by the administration.</p>
          <div class="establishment-box">
            <strong>Status:</strong> Admission Approved & Active
          </div>
          <p>You can now log in to your dashboard to access your space.</p>
          <a href="${link}"
             style="display:block;width:fit-content;margin:24px auto;background:#2e7d32;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">
            Go to Dashboard
          </a>
          <div class="info-box">
             You now have access to all the features and updates from your establishment.
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

export async function sendApprovalEmail(
  email: string,
  fullName: string,
  establishmentName: string,
) {
  const link = `${ENV.CLIENT_URL}/`;
  try {
    const { data, error } = await resend.emails.send({
      from: "MyScholaria <no-reply@ibc-hub.me>",
      to: email,
      subject: `Your admission to ${establishmentName} has been approved! - MyScholaria`,
      html: approvalTemplate(fullName, establishmentName, link),
    });
    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'approbation :", error);
    throw error;
  }
}

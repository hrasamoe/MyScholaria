import { ENV } from "../../config/env";
import { transporter } from "../email.service";

function confirmationTemplate(fullName: string, link: string) {
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
        .btn { display: block; width: fit-content; margin: 24px auto; background: #1976d2; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; }
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
          <p>Bonjour <strong>${fullName}</strong>,</p>
          <p>Merci de vous être inscrit sur <strong>MyScholaria</strong>. Veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>
          <a href="${link}" class="btn">Confirmer mon email</a>
          <div class="expire">
            ⏱ Ce lien expire dans <strong>24 heures</strong>.<br>
            Si vous n'avez pas créé de compte, ignorez cet email.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} MyScholaria — Tous droits réservés
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendConfirmationEmail(
  email: string,
  fullName: string,
  token: string,
) {
  const link = `${ENV.CLIENT_URL}/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `MyScholaria`,
    to: email,
    subject: "Confirmation de votre adresse email - MyScholaria",
    html: confirmationTemplate(fullName, link),
  });
}

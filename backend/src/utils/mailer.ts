import nodemailer from 'nodemailer';
import { config } from './config';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${config.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Vérifiez votre adresse email — Tête dans les Nuages',
    html: `
      <h1>Bienvenue !</h1>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <a href="${url}">${url}</a>
      <p>Ce lien expire dans 24h.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${config.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: 'Réinitialisation de mot de passe — Tête dans les Nuages',
    html: `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${url}">${url}</a>
      <p>Ce lien expire dans 1h.</p>
    `,
  });
}

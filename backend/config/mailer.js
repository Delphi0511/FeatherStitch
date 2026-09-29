import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// SMTP settings come from .env (e.g. Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465 and an App Password).
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

export const mailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = mailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// One line at startup so it's obvious whether reset emails are really being sent.
console.log(
  mailConfigured
    ? `Mail: sending via ${SMTP_HOST} as ${SMTP_USER}`
    : "Mail: SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env), so emails are printed here instead"
);

// Sends an email; without SMTP settings (local development) it prints the email to the console instead.
export async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`\n[mail not configured, printing instead]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  await transporter.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, text, html });
}

import sgMail from "@sendgrid/mail";

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "noreply@blindapp.local";

if (!sendgridApiKey) {
  throw new Error("SENDGRID_API_KEY is not set in environment variables");
}
sgMail.setApiKey(sendgridApiKey);

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  const msg = {
    to,
    from: fromEmail,
    subject,
    text,
    html: html || undefined,
  };
  await sgMail.send(msg);
}

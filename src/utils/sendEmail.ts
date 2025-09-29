import sgMail from "@sendgrid/mail";

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "noreply@blindapp.local";

if (!sendgridApiKey) {
  throw new Error("SENDGRID_API_KEY is not set in environment variables");
}
sgMail.setApiKey(sendgridApiKey);

/**
 * Sends an email using SendGrid with the configured sender address.
 *
 * The sender address is taken from the `EMAIL_FROM` environment variable or the default `noreply@blindapp.local`.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param text - Plain-text email body
 * @param html - Optional HTML email body
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  try {
    const msg = {
      to,
      from: fromEmail,
      subject,
      text,
      html: html || undefined,
    };
    await sgMail.send(msg);
  } catch (error) {
    console.error("Failed to send email", error);
    throw error;
  }
}

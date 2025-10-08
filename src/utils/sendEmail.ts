import sgMail from "@sendgrid/mail";

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "noreply@blindapp.local";

if (!sendgridApiKey) {
    throw new Error("SENDGRID_API_KEY is not set in environment variables");
}
sgMail.setApiKey(sendgridApiKey);

/**
 * Sends an email using the configured SendGrid client.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param text - Plain-text email body
 * @param html - Optional HTML email body
 *
 * Note: Errors encountered while sending are caught and logged and will not be thrown to the caller.
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
) {
    try {
        const msg = {
            to,
            from: fromEmail,
            subject,
            text: text || undefined,
            html: html,
        };
        const _res = await sgMail.send(msg);
    } catch (e: unknown) {
        console.table(e);
    }
}

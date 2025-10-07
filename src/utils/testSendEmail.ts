/**
 * @fileoverview Email sending test utility.
 * Standalone script to test the custom SMTP email functionality.
 * @module utils/testSendEmail
 */
import { sendEmail } from "./sendEmail";

/**
 * Main function to test email sending functionality.
 * Sends a test email using the configured SMTP settings.
 *
 * @async
 * @function main
 * @returns {Promise<void>}
 *
 * @example
 * // Run this script with:
 * // node src/utils/testSendEmail.ts
 * // or
 * // ts-node src/utils/testSendEmail.ts
 *
 * @description
 * This script:
 * 1. Reads SMTP_USER from environment variables
 * 2. Sends a test email to that address
 * 3. Logs success or failure to console
 *
 * Environment variables required:
 * - SMTP_USER: Recipient email address
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port
 * - SMTP_PASSWORD: SMTP authentication password
 *
 * @throws {Error} If email sending fails or environment variables are missing
 */
async function main() {
  try {
    await sendEmail(
      process.env.SMTP_USER || "",
      "Test Email from Blind App",
      "This is a test email sent using the custom SMTP client.",
    );
    console.log("Email sent successfully!");
  } catch (e) {
    console.error("Failed to send email:", e);
  }
}

main();

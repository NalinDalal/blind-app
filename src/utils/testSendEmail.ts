import { sendEmail } from "./sendEmail";

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

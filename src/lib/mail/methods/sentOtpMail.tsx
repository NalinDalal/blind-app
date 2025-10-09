import { renderTemplate } from "@/lib/mail/methods/renderTemplate";
import { sendEmail } from "@/utils/sendEmail";
import OtpRequestEmail from "../../../../emails/OtpRequestEmail";

interface OtpRequestMailProps {
  otpCode: string;
  to: string;
}

export const sendOtpMail = async ({ otpCode, to }: OtpRequestMailProps) => {
  try {
    const content = await renderTemplate(OtpRequestEmail, {
      //otpCode: "123456",
      otpCode,
    });
    await sendEmail(to, "OTP Request", content);
  } catch (e) {
    console.error(`Error sending email: `, e);
    throw new Error(`Failed sending email: `, { cause: e });
  }
};

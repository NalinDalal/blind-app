import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

// Define the props for our email component
interface OtpEmailProps {
  otpCode?: string;
}

// Set a default OTP for previewing in the development environment
const defaultOtp = "123456";

export const OtpEmail = ({ otpCode = defaultOtp }: OtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your One-Time Password for Registration</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-lg rounded-md border border-solid border-gray-300 bg-white p-8">
            <Section className="text-center">
              <Heading className="text-2xl font-bold text-black">
                Welcome Aboard!
              </Heading>
              <Text className="text-md text-gray-600">
                Thanks for starting your registration. Here is your One-Time
                Password (OTP) to complete the process.
              </Text>
            </Section>

            <Section className="my-8 text-center">
              <Text className="text-lg text-gray-700">Your OTP is:</Text>
              <Text className="text-4xl font-extrabold tracking-widest text-black">
                {otpCode}
              </Text>
            </Section>

            <Section className="text-center">
              <Text className="text-sm text-gray-500">
                This OTP is valid for 3 minutes. Please do not share this code
                with anyone.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OtpEmail;

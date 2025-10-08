// Extracted core logic for register validation (for testability)
interface ValidateRegisterOptions {
  email: string;
  password: string;
  emailRegex?: RegExp;
  passwordMinLength?: number;
}

export function validateRegister({
  email,
  password,
  emailRegex = /^\w+@oriental\.ac\.in$/i,
  passwordMinLength = 8,
}: ValidateRegisterOptions) {
  if (!email || !password) {
    return { ok: false, error: "Email and password required" };
  }
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Only college emails (@oriental.ac.in) are allowed." };
  }
  if (password.length < passwordMinLength) {
    return {
      ok: false,
      error: `Password must be at least ${passwordMinLength} characters long`,
    };
  }
  return { ok: true };
}

// Extracted core logic for login validation (for testability)
interface ValidateLoginOptions {
  email: string;
  password: string;
  emailRegex?: RegExp;
}

export function validateLogin({
  email,
  password,
  emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}: ValidateLoginOptions) {
  if (!email || !password) {
    return { ok: false, error: "Email and password required" };
  }
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Invalid email format" };
  }
  return { ok: true };
}

// Extracted core logic for login validation (for testability)
export function validateLogin({
  email,
  password,
  emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}) {
  if (!email || !password) {
    return { ok: false, error: "Email and password required" };
  }
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Invalid email format" };
  }
  return { ok: true };
}

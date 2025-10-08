// Extracted core logic for anonName validation (for testability)
interface ValidateAnonNameOptions {
  anonName: string;
  reservedNames?: string[];
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  analyzeToxicity?: (name: string) => { isToxic: boolean };
}

export function validateAnonName({
  anonName,
  reservedNames = ["admin", "moderator", "system", "anonymous", "deleted"],
  minLength = 3,
  maxLength = 20,
  regex = /^[a-zA-Z0-9_-]+$/,
  analyzeToxicity = () => ({ isToxic: false }),
}: ValidateAnonNameOptions) {
  if (!anonName) {
    return { ok: false, error: "anonName required" };
  }
  if (anonName.length < minLength || anonName.length > maxLength) {
    return {
      ok: false,
      error: `anonName must be between ${minLength} and ${maxLength} characters`,
    };
  }
  if (!regex.test(anonName)) {
    return {
      ok: false,
      error: "anonName can only contain letters, numbers, underscores, and hyphens",
    };
  }
  if (reservedNames.includes(anonName.toLowerCase())) {
    return { ok: false, error: "This anonName is reserved" };
  }
  if (analyzeToxicity(anonName).isToxic) {
    return { ok: false, error: "Inappropriate anonName" };
  }
  return { ok: true };
}

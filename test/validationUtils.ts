// Shared validation utilities for endpoint logic tests
export function requireFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): string | null {
  for (const field of fields) {
    if (!obj[field]) return `Missing ${fields.join(", ")}`;
  }
  return null;
}

export function checkToxicity(
  value: string,
  analyzeToxicity: (val: string) => { isToxic: boolean },
  errorMsg: string,
): string | null {
  if (analyzeToxicity(value).isToxic) return errorMsg;
  return null;
}

export function checkExists(exists: boolean, errorMsg: string): string | null {
  if (!exists) return errorMsg;
  return null;
}

export function checkRegex(
  value: string,
  regex: RegExp,
  errorMsg: string,
): string | null {
  if (!regex.test(value)) return errorMsg;
  return null;
}

export function checkReserved(
  value: string,
  reserved: string[],
  errorMsg: string,
): string | null {
  if (reserved.includes(value.toLowerCase())) return errorMsg;
  return null;
}

export function checkLength(
  value: string,
  min: number,
  max: number,
  errorMsg: string,
): string | null {
  if (value.length < min || value.length > max) return errorMsg;
  return null;
}

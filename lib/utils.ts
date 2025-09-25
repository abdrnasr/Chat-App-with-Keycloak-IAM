import crypto from "crypto";

/**
 * Formats a given Date object into a string representation with the following format:
 * `<day> <month> <year> <hour>:<minute>`. The month is abbreviated and the comma
 * used as a separator between the day and month is removed.
 *
 * @param {Date} date - The date to format.
 * @return {string} The formatted date string.
 */
export function formatDate(date: Date) {
  return date.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(',', '');
}


/**
 * Compares two strings for equality ignoring case.
 *
 * @param {string} a - The first string to compare.
 * @param {string} b - The second string to compare.
 * @return {boolean} `true` if the strings are equal ignoring case, or `false`
 *     otherwise.
 */
export function equalsIgnoreCase(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Decodes a JSON Web Token (JWT) and returns the payload as the specified type.
 *
 * @param {string} token - The JWT to decode.
 * @return {T} The decoded payload of the JWT.
 * @template T - The type of the decoded payload.
 */
export function decodeJwt<T = unknown>(token: string): T {
  const base64Payload = token.split(".")[1];
  const payload = Buffer.from(base64Payload, "base64").toString();
  return JSON.parse(payload) as T;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}
export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a, 'utf8')
  const B = Buffer.from(b, 'utf8')
  if (A.length !== B.length) return false
  return crypto.timingSafeEqual(A, B)
}

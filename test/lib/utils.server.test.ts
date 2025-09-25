import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatDate, equalsIgnoreCase, decodeJwt, getErrorMessage, safeEqual } from "@/lib/utils"; // <- fix path

describe("formatDate", () => {
  const realToLocale = Date.prototype.toLocaleString;

  beforeEach(() => {
    // Make the test deterministic across OS/timezones/locales
    vi.spyOn(Date.prototype as any, "toLocaleString").mockImplementation(
      function (_locale: any, _opts: any) {
        // Simulate en-GB output "24 Sep 2025, 14:05"
        return "24 Sep 2025, 14:05";
      }
    );
  });

  afterEach(() => {
    // restore original
    Date.prototype.toLocaleString = realToLocale;
    vi.restoreAllMocks();
  });

  it("formats to 'DD Mon YYYY HH:MM' and removes the comma", () => {
    const d = new Date("2025-09-24T14:05:00.000Z");
    const out = formatDate(d);
    expect(out).toBe("24 Sep 2025 14:05"); // no comma
  });
});

describe("equalsIgnoreCase", () => {
  it("returns true when strings are equal ignoring case", () => {
    expect(equalsIgnoreCase("Hello", "hELLo")).toBe(true);
  });

  it("returns false when strings differ beyond case", () => {
    expect(equalsIgnoreCase("Hello", "Hell0")).toBe(false);
  });
});

describe("decodeJwt", () => {
  it("decodes the payload JSON", () => {
    type Payload = { sub: string; name: string };
    // Build a simple (non-url-safe) base64 token body to match current implementation
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64");
    const body: Payload = { sub: "123", name: "johndoe" };
    const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64");
    const token = `${header}.${payloadB64}.`; // signature unused

    const decoded = decodeJwt<Payload>(token);
    expect(decoded).toEqual(body);
  });

  it("throws on invalid tokens (no second part)", () => {
    // decodeJwt will try to Buffer.from(undefined, "base64"), which throws.
    expect(() => decodeJwt<any>("invalid")).toThrow();
  });
});

describe("getErrorMessage", () => {
  it("returns message from Error instance", () => {
    expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
  });

  it("returns string as-is", () => {
    expect(getErrorMessage("Oops")).toBe("Oops");
  });

  it("returns 'Unknown error' for non-string non-Error", () => {
    expect(getErrorMessage({ code: 500 })).toBe("Unknown error");
    expect(getErrorMessage(null)).toBe("Unknown error");
    expect(getErrorMessage(undefined)).toBe("Unknown error");
  });
});

describe("safeEqual", () => {
  it("returns true when strings are exactly equal", () => {
    expect(safeEqual("secret123", "secret123")).toBe(true);
  });

  it("returns false when strings differ but have the same length", () => {
    expect(safeEqual("secret123", "secreT123")).toBe(false);
  });

  it("returns false when strings differ in length", () => {
    expect(safeEqual("short", "longer")).toBe(false);
  });

  it("handles empty strings correctly", () => {
    expect(safeEqual("", "")).toBe(true);
    expect(safeEqual("", "nonempty")).toBe(false);
  });

  // Test case to uncomment
  it("A test made to fail intentionally", () => {
    expect(safeEqual("", "")).toBe(false);
  });
});
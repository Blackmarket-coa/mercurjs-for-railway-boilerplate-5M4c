import {
  isValidEmail,
  normalizeEmail,
  sanitizeFilename,
  sanitizeString,
  strongPasswordSchema,
} from "../validation"

describe("shared validation utilities", () => {
  it("normalizes email by trimming and lowercasing", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com")
  })

  it("validates a well-formed email", () => {
    expect(isValidEmail("hello@example.com")).toBe(true)
    expect(isValidEmail("not-an-email")).toBe(false)
  })

  it("sanitizes dangerous characters from strings", () => {
    expect(sanitizeString(" <script>alert(1)</script> ")).toBe("scriptalert(1)/script")
  })

  it("sanitizes path traversal characters from filenames", () => {
    expect(sanitizeFilename("../unsafe/..\\my<file>.txt")).toBe("unsafemyfile.txt")
  })

  it("enforces strong password requirements", () => {
    expect(() => strongPasswordSchema.parse("Weakpass")).toThrow("one number")
    expect(strongPasswordSchema.parse("StrongPass1")).toBe("StrongPass1")
  })
})

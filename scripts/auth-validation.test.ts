import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, signupSchema, lawyerSignupSchema } from "../src/lib/validations/auth.ts";

test("invalid login preserves the form error contract", () => {
  const result = loginSchema.safeParse({ email: "invalid", password: "" });
  assert.equal(result.success, false);
  if (result.success) throw new Error("Expected validation failure");
  assert.ok(Array.isArray(result.error.errors));
  assert.ok(result.error.errors.some(issue => issue.path[0] === "email"));
  assert.ok(result.error.errors.some(issue => issue.path[0] === "password"));
});

test("field validation provides a readable first error", () => {
  const result = loginSchema.shape.email.safeParse("invalid");
  assert.equal(result.success, false);
  if (result.success) throw new Error("Expected validation failure");
  assert.equal(typeof result.error.errors[0].message, "string");
});

test("signup rejects weak passwords without losing field errors", () => {
  const result = signupSchema.safeParse({ name: "Test User", email: "test@example.com", password: "weak" });
  assert.equal(result.success, false);
  if (result.success) throw new Error("Expected validation failure");
  assert.ok(result.error.errors.some(issue => issue.path[0] === "password"));
});

test("valid signup still passes", () => {
  assert.equal(signupSchema.safeParse({ name: "Test User", email: "test@example.com", password: "StrongPassword123" }).success, true);
});

test("lawyer enrollment preserves validation error handling", () => {
  const result = lawyerSignupSchema.safeParse({ email: "invalid", password: "weak" });
  assert.equal(result.success, false);
  if (result.success) throw new Error("Expected validation failure");
  assert.ok(result.error.errors.length > 0);
});

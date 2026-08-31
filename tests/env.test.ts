import { describe, it, expect } from "vitest";
import { pemFromEnv } from "@/lib/env";

describe("pemFromEnv", () => {
  it("passes through raw PEM", () => {
    expect(pemFromEnv("-----BEGIN X-----\nabc")).toBe("-----BEGIN X-----\nabc");
  });
  it("decodes base64", () => {
    expect(pemFromEnv(Buffer.from("hello").toString("base64"))).toBe("hello");
  });
  it("undefined stays undefined", () => {
    expect(pemFromEnv(undefined)).toBeUndefined();
  });
});

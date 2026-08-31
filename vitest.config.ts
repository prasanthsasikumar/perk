import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 20000,
    hookTimeout: 60000,
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // convex-test has to be bundled with the tests so it can load the convex/ modules
    server: { deps: { inline: ["convex-test"] } },
  },
});

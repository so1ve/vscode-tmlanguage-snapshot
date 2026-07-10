import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { vsCodeWorker } from "vitest-environment-vscode";

const r = (s: string) => fileURLToPath(new URL(s, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@vscode-tmlanguage-snapshot/core": r("./packages/core/src/index.ts"),
      "@vscode-tmlanguage-snapshot/vscode": r("./packages/vscode/src/index.ts"),
      "vscode-tmlanguage-snapshot": r("./packages/standalone/src/index.ts"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["test/**/*.test.ts", "packages/*/test/**/*.test.ts"],
        },
      },
      {
        extends: true,
        root: r("./packages/vscode/playground"),
        test: {
          name: "vscode",
          pool: vsCodeWorker({
            reuseWorker: false,
            version: "1.105.1",
          }),
          include: ["src/**/*.test.ts"],
          testTimeout: 60_000,
          server: {
            deps: {
              external: [/^vscode$/],
            },
          },
        },
      },
    ],
  },
});

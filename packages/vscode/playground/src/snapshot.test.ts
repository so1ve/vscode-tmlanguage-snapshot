import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createGrammarSnapshot } from "@vscode-tmlanguage-snapshot/vscode";
import { describe, expect, it } from "vitest";

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("VS Code injection grammar integration", async () => {
  const snapshot = await createGrammarSnapshot(
    join(rootDirectory, "package.json"),
  );

  it("loads the built-in TypeScript host and contributed injection", async () => {
    const result = await snapshot("fixtures/example.ts");

    expect(result).toContain("source.ts");
    expect(result).toContain("keyword.todo.snapshot");
    expect(result).toMatchSnapshot();
  });
});

import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import { describe, expect, it } from "vitest";
import { createGrammarSnapshot } from "vscode-tmlanguage-snapshot";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "__fixtures__/vue-language-tools");
const grammarFixturesDir = join(fixturesDir, "tests/grammarFixtures");

describe("vue-language-tools", async () => {
  const snapshot = await createGrammarSnapshot(
    join(fixturesDir, "package.json"),
  );
  const fixtures = await fg("**/*.vue", {
    absolute: true,
    cwd: grammarFixturesDir,
  });

  for (const path of fixtures) {
    it(relative(grammarFixturesDir, path).replace(/\\/g, "/"), async () => {
      const result = await snapshot(path);

      expect(result).toMatchSnapshot();
    });
  }
});

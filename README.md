# vscode-tmlanguage-snapshot

Take readable snapshots of TextMate grammar scopes.

[![NPM version](https://img.shields.io/npm/v/vscode-tmlanguage-snapshot?color=a1b858&label=)](https://www.npmjs.com/package/vscode-tmlanguage-snapshot)

## Packages

| Package                              | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `@vscode-tmlanguage-snapshot/core`   | Snapshot rendering from TextMate tokens              |
| `vscode-tmlanguage-snapshot`         | TextMate grammar snapshots in Node.js                |
| `@vscode-tmlanguage-snapshot/vscode` | TextMate grammar snapshots in VS Code Extension Host |

## Node.js usage

```bash
pnpm add -D vscode-tmlanguage-snapshot
```

```ts
import path from "node:path";

import { createGrammarSnapshot } from "vscode-tmlanguage-snapshot";

const packageJsonPath = path.resolve(import.meta.dirname, "../package.json");
const snapshot = await createGrammarSnapshot(packageJsonPath);

it("tokenizes a fixture", async () => {
  const result = await snapshot("tests/fixtures/basic.vue");

  expect(result).toMatchSnapshot();
});
```

## Injection grammars in VS Code

Use `@vscode-tmlanguage-snapshot/vscode` when the grammar depends on VS Code's built-in or installed extensions:

```bash
pnpm add -D @vscode-tmlanguage-snapshot/vscode vitest-environment-vscode
```

Configure Vitest so its root is the extension whose `package.json` contributes the injection grammar:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { vsCodeWorker } from "vitest-environment-vscode";

export default defineConfig({
  test: {
    pool: vsCodeWorker({
      // Pin this so built-in grammar updates do not rewrite snapshots.
      version: "1.105.1",
    }),
    server: {
      deps: {
        external: [/^vscode$/],
      },
    },
  },
});
```

Create snapshots inside the Extension Host:

```ts
import path from "node:path";

import { createGrammarSnapshot } from "@vscode-tmlanguage-snapshot/vscode";

const snapshot = await createGrammarSnapshot(
  path.resolve(import.meta.dirname, "../package.json"),
);

it("applies contributed injections", async () => {
  const result = await snapshot("fixtures/example.ts");

  expect(result).toMatchSnapshot();
});
```

VS Code loads the tested extension's `injectTo` contribution and its target grammar before scopes are captured. No host grammar path is required.

This package is intended for desktop Extension Host tests. Pin and test the VS Code version you support.

## Credits

Ported from [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test).

## License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve).

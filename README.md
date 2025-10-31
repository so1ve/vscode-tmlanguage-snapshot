# vscode-tmlanguage-snapshot

Take snapshots of your tmLanguage grammar.

[![NPM version](https://img.shields.io/npm/v/vscode-tmlanguage-snapshot?color=a1b858&label=)](https://www.npmjs.com/package/vscode-tmlanguage-snapshot)

## 📦 Installation

```bash
$ npm install vscode-tmlanguage-snapshot
$ yarn add vscode-tmlanguage-snapshot
$ pnpm add vscode-tmlanguage-snapshot
```

## 🚀 Usage

```ts
// tests/grammar.spec.ts
import { createGrammarSnapshot } from "vscode-tmlanguage-snapshot";

const packageJsonPath = path.resolve(__dirname, "../package.json");
const snapshot = await createGrammarSnapshot(packageJsonPath);
const fixtures = fs.readdirSync(fixturesDir);

for (const fixture of fixtures) {
	it(fixture, async () => {
		const result = await snapshot(`tests/grammarFixtures/${fixture}`);

		expect(result).toMatchSnapshot();
	});
}
```

You can also refer to our [tests](test/index.test.ts) for more examples.

## 🤝 Credits

Ported from [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test), refactored for better library usage.

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)

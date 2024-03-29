import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import { describe, expect, it } from "vitest";

import { createGrammarSnapshot } from "../src";

const __dirname = dirname(fileURLToPath(import.meta.url));

function runSnapshot(dir: string) {
	describe(dir, async () => {
		const fixturesDir = join(__dirname, `__fixtures__/${dir}`);
		const snapshot = await createGrammarSnapshot(
			join(fixturesDir, "package.json"),
		);
		const cases = await fg(join(fixturesDir, "cases/**").replace(/\\/g, "/"));

		for (const path of cases) {
			it(relative(fixturesDir, path).replace(/\\/g, "/"), async () => {
				const result = await snapshot(path);

				expect(result).toMatchSnapshot();
			});
		}
	});
}

runSnapshot("vue-language-tools");

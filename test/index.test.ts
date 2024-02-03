import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import fg from "fast-glob";
import { describe, expect, it } from "vitest";

import { createGrammarSnapshot } from "../src";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readContentGlob(glob: string) {
	const files = fg.sync(glob, { dot: true });

	return Object.fromEntries(
		files.map((file) => [file, readFileSync(file, "utf-8")]),
	);
}

function runSnapshot(dir: string) {
	describe(dir, async () => {
		const fixturesDir = join(__dirname, `__fixtures__/${dir}`);
		const snapshot = await createGrammarSnapshot(
			join(fixturesDir, "package.json"),
		);
		const cases = readContentGlob(
			join(fixturesDir, "cases/**").replace(/\\/g, "/"),
		);

		for (const [path, content] of Object.entries(cases)) {
			// eslint-disable-next-line vitest/valid-title

			it(path, async () => {
				const result = await snapshot(path, content);

				expect(result).toMatchSnapshot();
			});
		}
	});
}

runSnapshot("vue-language-tools");

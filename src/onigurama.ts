import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import * as oniguruma from "vscode-oniguruma";
import type * as tm from "vscode-textmate";

const require = createRequire(import.meta.url);

export async function createOniguramaLib() {
	const wasmPath = join(
		dirname(require.resolve("vscode-oniguruma")),
		"onig.wasm",
	);
	const wasmBin = await readFile(wasmPath);
	await oniguruma.loadWASM(wasmBin);

	return {
		createOnigScanner(patterns) {
			return new oniguruma.OnigScanner(patterns);
		},
		createOnigString(s) {
			return new oniguruma.OnigString(s);
		},
	} as tm.IOnigLib;
}

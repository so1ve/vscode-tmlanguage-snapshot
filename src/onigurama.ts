import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { OnigScanner, OnigString, loadWASM } from "vscode-oniguruma";
import type { IOnigLib } from "vscode-textmate";

const require = createRequire(import.meta.url);

export async function createOniguramaLib() {
	const wasmPath = join(
		dirname(require.resolve("vscode-oniguruma")),
		"onig.wasm",
	);
	const wasmBin = await readFile(wasmPath);
	await loadWASM(wasmBin);

	return {
		createOnigScanner(patterns) {
			return new OnigScanner(patterns);
		},
		createOnigString(s) {
			return new OnigString(s);
		},
	} as IOnigLib;
}

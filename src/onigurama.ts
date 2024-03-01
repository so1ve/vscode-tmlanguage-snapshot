import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import * as oniguruma from "vscode-oniguruma";
import type { IOnigLib } from "vscode-textmate";

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
	} as IOnigLib;
}

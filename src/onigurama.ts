import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import oniguruma from "vscode-oniguruma";
import type { IOnigLib } from "vscode-textmate";

const { OnigScanner, OnigString, loadWASM } = oniguruma;

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

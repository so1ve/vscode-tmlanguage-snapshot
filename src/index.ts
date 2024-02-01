import { dirname, join } from "node:path";

import * as tm from "vscode-textmate";

import type { Grammar, GrammarSnapshotOptions } from "./types";

export async function createGrammarSnapshot(
	packageJsonPath: string,
	options: GrammarSnapshotOptions = {},
) {
	const packageJson = await import(packageJsonPath);
}

import { readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";

import { createOniguramaLib } from "./onigurama";
import { renderSnapshotFromLineAndTokens } from "./snapshot";
import { createTextmateRegistry } from "./textmate";
import { getLineWithTokens } from "./token";
import type { Grammar, GrammarSnapshotOptions, Language } from "./types";

export async function createGrammarSnapshot(
	packageJsonPath: string,
	options: GrammarSnapshotOptions = {},
) {
	const grammars: Grammar[] = [];

	if (options.extraGrammarPaths) {
		grammars.push(
			...options.extraGrammarPaths.map((path: string) => ({
				path,
				scopeName: "",
			})),
		);
	}

	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
	const packageDir = dirname(packageJsonPath);
	const contributeGrammars: Grammar[] = packageJson.contributes?.grammars ?? [];
	const contributeLanguages: Language[] =
		packageJson.contributes?.languages ?? [];

	grammars.push(
		...contributeGrammars.map((grammar) => {
			const path = join(packageDir, grammar.path);

			return { ...grammar, path };
		}),
	);

	const languageToScope = grammars
		.filter(
			(language): language is Grammar & { language: string } =>
				!!language.language,
		)
		.map(({ language, scopeName }) => ({ [language]: scopeName }))
		.reduce((a, b) => ({ ...a, ...b }), {});

	const extensionToLang = contributeLanguages
		.filter(
			(language): language is Language & { extensions: string[] } =>
				!!language.extensions,
		)
		.flatMap(({ extensions, id }) => extensions.map((e) => ({ [e]: id })))
		.reduce((a, b) => ({ ...a, ...b }), {});

	const getScope = (extension: string) =>
		languageToScope[extensionToLang[extension]];

	const grammarsWithContent = await Promise.all(
		grammars.map(async (grammar) => {
			const content = await readFile(grammar.path, "utf-8");

			return { grammar, content };
		}),
	);

	const oniguramaLib = createOniguramaLib();
	const registry = createTextmateRegistry(grammarsWithContent, oniguramaLib);

	async function snapshot(filename: string, content: string) {
		const scope = getScope(extname(filename));
		if (!scope) {
			throw new Error(`No scope found for ${filename}`);
		}
		const lineWithTokens = await getLineWithTokens(registry, scope, content);

		return renderSnapshotFromLineAndTokens(lineWithTokens);
	}

	return snapshot;
}

import type { IToken } from "vscode-textmate";

export interface GrammarSnapshotOptions {
	extraGrammarPaths?: string[];
}

export interface Language {
	id: string;
	extensions?: string[];
	configuration?: string;
}

export interface Grammar {
	path: string;
	language?: string;
	scopeName: string;
	embeddedLanguages?: Record<string, string>;
	tokenTypes?: Record<string, string>;
	injectTo?: string[];
}

export interface LineWithTokens {
	line: string;
	tokens: IToken[];
}

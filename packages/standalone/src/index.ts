import { readFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, join } from "node:path";

import { renderSnapshot } from "@vscode-tmlanguage-snapshot/core";

import { createOniguramaLib } from "./onigurama";
import type { GrammarContribution } from "./textmate";
import { createTextmateRegistry } from "./textmate";
import { getTokenSegments } from "./token";

export interface GrammarSnapshotOptions {
  /**
   * Additional raw TextMate grammar files to load.
   */
  extraGrammarPaths?: string[];
}

interface LanguageContribution {
  id: string;
  extensions?: string[];
}

export async function createGrammarSnapshot(
  packageJsonPath: string,
  options: GrammarSnapshotOptions = {},
) {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as {
    contributes?: {
      grammars?: GrammarContribution[];
      languages?: LanguageContribution[];
    };
  };
  const rootDirectory = dirname(packageJsonPath);

  const grammars: GrammarContribution[] = [
    ...(options.extraGrammarPaths ?? []).map((path) => ({
      path,
      scopeName: "",
    })),
    ...(packageJson.contributes?.grammars ?? []).map((grammar) => ({
      ...grammar,
      path: join(rootDirectory, grammar.path),
    })),
  ];
  const languages = packageJson.contributes?.languages ?? [];

  const languageToScope = Object.fromEntries(
    grammars.flatMap(({ language, scopeName }) =>
      language ? [[language, scopeName] as const] : [],
    ),
  );
  const extensionToLanguage = Object.fromEntries(
    languages.flatMap(({ extensions, id }) =>
      (extensions ?? []).map((extension) => [extension, id] as const),
    ),
  );

  const grammarsWithContent = await Promise.all(
    grammars.map(async (grammar) => ({
      grammar,
      content: await readFile(grammar.path, "utf-8"),
    })),
  );

  const registry = createTextmateRegistry(
    grammarsWithContent,
    createOniguramaLib(),
  );

  return async function snapshot(path: string) {
    const scope = languageToScope[extensionToLanguage[extname(path)]];
    if (!scope) {
      throw new Error(`No scope found for ${path}`);
    }

    const absolutePath = isAbsolute(path) ? path : join(rootDirectory, path);
    const content = await readFile(absolutePath, "utf-8");
    const segments = await getTokenSegments(registry, scope, content);

    return renderSnapshot(content, segments);
  };
}

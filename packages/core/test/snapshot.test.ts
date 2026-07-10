import type { SnapshotTokenSegment } from "@vscode-tmlanguage-snapshot/core";
import { renderSnapshot } from "@vscode-tmlanguage-snapshot/core";
import { describe, expect, it } from "vitest";

const invalidTokenStreams: {
  name: string;
  source: string;
  segments: SnapshotTokenSegment[];
}[] = [
  { name: "missing", source: "a", segments: [] },
  {
    name: "empty",
    source: "a",
    segments: [{ content: "", scopes: ["source.a"] }],
  },
  {
    name: "mismatched",
    source: "a",
    segments: [{ content: "b", scopes: ["source.b"] }],
  },
  {
    name: "extra",
    source: "",
    segments: [{ content: "a", scopes: ["source.a"] }],
  },
];

describe("snapshot renderer", () => {
  it("preserves legacy lone carriage returns as source content", () => {
    const result = renderSnapshot("a\rb", [
      { content: "a\rb", scopes: ["source.text"] },
    ]);

    expect(result).toBe(">a\rb\n#^^^ source.text");
  });

  it("preserves TextMate virtual end-of-line markers", () => {
    const result = renderSnapshot("a\n", [
      {
        content: "a",
        scopes: ["source.a"],
        includesVirtualEndOfLine: true,
      },
      {
        content: "",
        scopes: ["source.a"],
        includesVirtualEndOfLine: true,
      },
    ]);

    expect(result).toBe([">a", "#^^ source.a", ">", "#^ source.a"].join("\n"));
  });

  it("renders sequential token segments with canonical source line semantics", () => {
    const result = renderSnapshot("😀\r\nx\ny\n\n", [
      { content: "😀", scopes: ["source.emoji"] },
      { content: "x", scopes: ["source.x"] },
      { content: "y", scopes: ["source.y"] },
    ]);

    expect(result).toBe(
      [
        ">😀",
        "#^^ source.emoji",
        ">x",
        "#^ source.x",
        ">y",
        "#^ source.y",
        ">",
        ">",
      ].join("\n"),
    );
  });

  it.each(invalidTokenStreams)(
    "rejects $name token streams",
    ({ source, segments }) => {
      expect(() => renderSnapshot(source, segments)).toThrow(TypeError);
    },
  );
});

import { defineConfig } from "tsdown";

export default defineConfig({
  workspace: "packages/*",
  entry: ["src/index.ts"],
  dts: true,
});

import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2022"
  },
  {
    entry: {
      "browser/dsa-shipshape": "src/index.ts"
    },
    format: ["iife"],
    globalName: "DSAShipshape",
    platform: "browser",
    dts: false,
    sourcemap: true,
    minify: true,
    clean: false,
    target: "es2020"
  }
]);

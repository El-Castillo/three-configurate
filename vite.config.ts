import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import { fromFileUrl } from "@std/path";

const preactDebugShim = fromFileUrl(
  new URL("./shims/preact/debug.module.js", import.meta.url),
);

export default defineConfig({
  plugins: [fresh(), tailwindcss()],
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/client": "preact/compat/client",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react-reconciler": "preact-reconciler",
      debug: "debug/src/browser.js",
      "preact/debug": preactDebugShim,
    },
  },
});

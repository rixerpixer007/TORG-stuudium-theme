import { defineConfig } from "wxt";

import { STUUDIUM_MATCHES } from "./src/shared/sites";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  manifest: {
    name: "TORG Stuudium Enhancement",
    description:
      "Applies the Intentional Dark theme and a local settings foundation to TORG Stuudium.",
    minimum_chrome_version: "96",
    permissions: ["storage", "scripting"],
    host_permissions: [...STUUDIUM_MATCHES],
    action: {
      default_title: "Open TORG Stuudium settings",
    },
  },
  webExt: {
    disabled: true,
  },
  zip: {
    artifactTemplate: "{{name}}-{{version}}-{{browser}}.zip",
    compressionLevel: 9,
  },
});

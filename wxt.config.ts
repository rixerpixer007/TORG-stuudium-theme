import { defineConfig } from "wxt";

import { STUUDIUM_MATCHES } from "./src/shared/sites";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  dev: {
    server: {
      port: 3000,
      strictPort: true,
    },
  },
  manifest: {
    name: "Sinu Stuudium",
    description:
      "Kohanda TORG Stuudium enda moodi – läbimõeldud tume kujundus ja praktilised täiustused.",
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
    minimum_chrome_version: "96",
    permissions: ["storage", "scripting"],
    host_permissions: [...STUUDIUM_MATCHES],
    action: {
      default_title: "Ava Sinu Stuudiumi seaded",
      default_icon: {
        16: "icons/icon-16.png",
        32: "icons/icon-32.png",
        48: "icons/icon-48.png",
        128: "icons/icon-128.png",
      },
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

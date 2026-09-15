import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

import { build } from "vite";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const CANONICAL_OUTPUT_DIRECTORY = path.join(
  PROJECT_ROOT,
  "apps/android/app/src/main/assets/mobile",
);

function listFiles(directory, root = directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listFiles(absolutePath, root);
      return [path.relative(root, absolutePath).split(path.sep).join("/")];
    })
    .sort((left, right) => left.localeCompare(right, "en"));
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

async function loadSharedConfiguration() {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "sid-mobile-config-"));
  const modulePath = path.join(temporaryDirectory, "config.mjs");

  try {
    await build({
      root: PROJECT_ROOT,
      publicDir: false,
      configFile: false,
      logLevel: "warn",
      build: {
        outDir: temporaryDirectory,
        emptyOutDir: false,
        sourcemap: false,
        minify: false,
        lib: {
          entry: path.join(PROJECT_ROOT, "src/mobile/entrypoints/config.ts"),
          formats: ["es"],
          fileName: () => "config.mjs",
        },
      },
    });

    const module = await import(`${pathToFileURL(modulePath).href}?v=${Date.now()}`);
    return module.MOBILE_CONFIG;
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

async function buildSettingsPage(outputDirectory) {
  const optionsDirectory = path.join(PROJECT_ROOT, "src/entrypoints/options");
  await build({
    root: optionsDirectory,
    base: "./",
    configFile: false,
    logLevel: "warn",
    publicDir: false,
    plugins: [
      {
        name: "sid-mobile-settings-entry",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            return html
              .replace(/\s*<meta name="manifest\.open_in_tab" content="true" \/>/, "")
              .replace(/\s*<script src="\/options-startup\.js"><\/script>/, "")
              .replace('src="/icons/icon-48.png"', 'src="../../../public/icons/icon-48.png"')
              .replace('src="./main.ts"', 'src="../../mobile/entrypoints/settings.ts"');
          },
        },
      },
    ],
    build: {
      outDir: path.join(outputDirectory, "settings"),
      emptyOutDir: true,
      sourcemap: false,
      target: "chrome96",
      rollupOptions: {
        input: path.join(optionsDirectory, "index.html"),
      },
    },
  });
}

async function buildBootstrap(outputDirectory) {
  await build({
    configFile: false,
    logLevel: "warn",
    publicDir: false,
    build: {
      outDir: path.join(outputDirectory, "injection"),
      emptyOutDir: true,
      sourcemap: false,
      target: "chrome96",
      minify: "oxc",
      lib: {
        entry: path.join(PROJECT_ROOT, "src/mobile/entrypoints/bootstrap.ts"),
        formats: ["iife"],
        name: "SidMobileBootstrap",
        fileName: () => "bootstrap.js",
      },
    },
  });

  const injectionDirectory = path.join(outputDirectory, "injection");
  fs.copyFileSync(
    path.join(PROJECT_ROOT, "src/theme/critical.css"),
    path.join(injectionDirectory, "critical.css"),
  );
  fs.copyFileSync(
    path.join(PROJECT_ROOT, "src/mobile/platform.css"),
    path.join(injectionDirectory, "platform.css"),
  );
  fs.copyFileSync(
    path.join(PROJECT_ROOT, "src/generated/theme.css"),
    path.join(injectionDirectory, "theme.css"),
  );
  fs.copyFileSync(
    path.join(PROJECT_ROOT, "src/platforms/webextension/settings-menu.css"),
    path.join(injectionDirectory, "settings-menu.css"),
  );
}

async function buildAssets(outputDirectory) {
  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  await Promise.all([buildSettingsPage(outputDirectory), buildBootstrap(outputDirectory)]);

  const configuration = await loadSharedConfiguration();
  fs.writeFileSync(
    path.join(outputDirectory, "config.json"),
    `${JSON.stringify(configuration, null, 2)}\n`,
  );

  const manifest = {
    schemaVersion: 1,
    files: listFiles(outputDirectory).map((relativePath) => ({
      path: relativePath,
      sha256: hashFile(path.join(outputDirectory, relativePath)),
    })),
  };
  fs.writeFileSync(
    path.join(outputDirectory, "asset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function assertDirectoriesEqual(actualDirectory, expectedDirectory) {
  const actualFiles = listFiles(actualDirectory);
  const expectedFiles = listFiles(expectedDirectory);
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error("Generated Android WebView asset filenames are stale; rebuild them.");
  }

  for (const relativePath of actualFiles) {
    const actual = fs.readFileSync(path.join(actualDirectory, relativePath));
    const expected = fs.readFileSync(path.join(expectedDirectory, relativePath));
    if (!actual.equals(expected)) {
      throw new Error(`Generated Android WebView asset is stale: ${relativePath}`);
    }
  }
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const temporaryDirectory = checkOnly
    ? fs.mkdtempSync(path.join(os.tmpdir(), "sid-mobile-assets-"))
    : undefined;
  const outputDirectory = temporaryDirectory ?? CANONICAL_OUTPUT_DIRECTORY;

  try {
    await buildAssets(outputDirectory);
    if (checkOnly) {
      if (!fs.existsSync(CANONICAL_OUTPUT_DIRECTORY)) {
        throw new Error("Android WebView assets are missing; run npm run build:mobile:web.");
      }
      assertDirectoriesEqual(CANONICAL_OUTPUT_DIRECTORY, outputDirectory);
      console.log("Android WebView asset check passed: generated assets are current.");
    } else {
      console.log(
        `Built Android WebView assets at ${path.relative(PROJECT_ROOT, outputDirectory)}.`,
      );
    }
  } finally {
    if (temporaryDirectory !== undefined) {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

await main();

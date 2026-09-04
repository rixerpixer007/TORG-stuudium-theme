import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const MODULE_DIRECTORY = path.join(PROJECT_ROOT, "src/theme/modules");
const HEADER_FILE = path.join(PROJECT_ROOT, "src/theme/userstyle-header.txt");
const BUILD_SCRIPT = path.join(SCRIPT_DIRECTORY, "build-theme.mjs");

let timer;
let building = false;
let buildQueued = false;

function build() {
  if (building) {
    buildQueued = true;
    return;
  }

  building = true;
  const child = execFile(process.execPath, [BUILD_SCRIPT], { cwd: PROJECT_ROOT });
  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);
  child.once("exit", (code) => {
    building = false;
    process.exitCode = code === 0 ? 0 : 1;
    if (buildQueued) {
      buildQueued = false;
      build();
    }
  });
}

function scheduleBuild() {
  clearTimeout(timer);
  timer = setTimeout(build, 75);
}

function sourceFingerprint() {
  const files = fs
    .readdirSync(MODULE_DIRECTORY)
    .filter((file) => file.endsWith(".css"))
    .map((file) => path.join(MODULE_DIRECTORY, file));

  return [...files, HEADER_FILE]
    .map((file) => {
      const stats = fs.statSync(file);
      return `${file}:${stats.mtimeMs}:${stats.size}`;
    })
    .join("|");
}

let fingerprint = sourceFingerprint();
const poller = setInterval(() => {
  const nextFingerprint = sourceFingerprint();
  if (nextFingerprint === fingerprint) return;
  fingerprint = nextFingerprint;
  scheduleBuild();
}, 500);

console.log("Watching theme modules and userstyle metadata for changes…");

function close() {
  clearInterval(poller);
  process.exit();
}

process.on("SIGINT", close);
process.on("SIGTERM", close);

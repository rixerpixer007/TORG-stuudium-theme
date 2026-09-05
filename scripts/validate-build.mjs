import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const BUILD_DIRECTORY = path.join(PROJECT_ROOT, ".output/chrome-mv3");
const EXPECTED_MATCH = "https://torg.ope.ee/*";
const packageMetadata = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"),
);

function walkFiles(directory, base = directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walkFiles(absolutePath, base)
      : [path.relative(base, absolutePath).split(path.sep).join("/")];
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (!fs.existsSync(BUILD_DIRECTORY)) {
  throw new Error("The production build is missing; run npm run build first");
}

const manifestPath = path.join(BUILD_DIRECTORY, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const files = walkFiles(BUILD_DIRECTORY).sort();

assert(manifest.manifest_version === 3, "Production manifest must use Manifest V3");
assert(manifest.version === packageMetadata.version, "Manifest and package versions differ");
assert(
  JSON.stringify([...(manifest.permissions ?? [])].sort()) ===
    JSON.stringify(["scripting", "storage"]),
  "Production permissions must contain only scripting and storage",
);
assert(
  JSON.stringify(manifest.host_permissions) === JSON.stringify([EXPECTED_MATCH]),
  "Production host access must be limited to the verified TORG origin",
);
assert(manifest.options_ui?.page === "options.html", "Options page is not registered");
assert(manifest.background?.service_worker !== undefined, "MV3 service worker is missing");
assert(Array.isArray(manifest.content_scripts), "Bootstrap content script is missing");
assert(manifest.content_scripts.length === 1, "Expected exactly one static content script");

const bootstrap = manifest.content_scripts[0];
assert(
  JSON.stringify(bootstrap.matches) === JSON.stringify([EXPECTED_MATCH]),
  "Bootstrap match pattern is broader than expected",
);
assert(bootstrap.run_at === "document_start", "Bootstrap must run at document_start");
assert(bootstrap.all_frames !== true, "Bootstrap must not run in child frames");
assert(
  bootstrap.world === undefined || bootstrap.world === "ISOLATED",
  "Bootstrap must be isolated",
);
assert(Array.isArray(bootstrap.css) && bootstrap.css.length > 0, "Theme CSS is missing");
assert(Array.isArray(bootstrap.js) && bootstrap.js.length === 1, "Bootstrap JS is missing");
assert(manifest.web_accessible_resources === undefined, "No web-accessible resources are expected");

const optionsHtml = fs.readFileSync(path.join(BUILD_DIRECTORY, "options.html"), "utf8");
assert(
  optionsHtml.includes('data-sid-settings-state="loading"') &&
    optionsHtml.includes('aria-busy="true"') &&
    optionsHtml.includes('data-sid-theme-cache-key="sid-settings-theme"') &&
    optionsHtml.includes('src="/options-startup.js"'),
  "Options page startup gate is missing",
);
assert(files.includes("options-startup.js"), "Options page startup script is missing");

const optionsStartup = fs.readFileSync(path.join(BUILD_DIRECTORY, "options-startup.js"), "utf8");
assert(
  optionsStartup.includes("localStorage.getItem") && optionsStartup.includes("data-sid-theme"),
  "Options page startup script does not restore the cached palette",
);

for (const file of files) {
  assert(!file.endsWith(".map"), `Source map must not be packaged: ${file}`);
  assert(!file.startsWith("src/"), `Source file must not be packaged: ${file}`);
  assert(!file.includes("node_modules"), `Dependency tree must not be packaged: ${file}`);
  assert(!file.startsWith("docs/"), `Documentation must not be packaged: ${file}`);
  assert(!file.startsWith(".env"), `Environment file must not be packaged: ${file}`);
}

const bundledCss = bootstrap.css
  .map((file) => fs.readFileSync(path.join(BUILD_DIRECTORY, file), "utf8"))
  .join("\n");
assert(
  bundledCss.includes("data-sid-enhancement=enabled]"),
  "Theme CSS is not gated by the extension activation attribute",
);
assert(bundledCss.includes("--sid-canvas:#0f1311"), "Full graphite theme is missing");
assert(
  bundledCss.includes("data-sid-theme=graphite-blue]") &&
    bundledCss.includes("--sid-accent:#75a7ff") &&
    bundledCss.includes("--sid-canvas:#0c1118"),
  "Graphite Blue theme is missing",
);
assert(
  bundledCss.includes("sid-extension-settings-menu-item"),
  "In-page settings menu styling is missing",
);

const bundledJavaScript = files
  .filter((file) => file.endsWith(".js"))
  .map((file) => fs.readFileSync(path.join(BUILD_DIRECTORY, file), "utf8"))
  .join("\n");
assert(
  bundledJavaScript.includes("data-sid-settings-state") &&
    /setAttribute\([^,]+,[`'"]ready[`'"]\)/.test(bundledJavaScript),
  "Options page does not release its startup gate",
);

for (const activationScript of ["activation-graphite-mint.js", "activation-graphite-blue.js"]) {
  assert(files.includes(activationScript), `Early theme script is missing: ${activationScript}`);
}

console.log(`Validated Manifest V3 production build with ${files.length} packaged files.`);

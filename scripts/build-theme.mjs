import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const MODULE_DIRECTORY = path.join(PROJECT_ROOT, "src/theme/modules");
const GENERATED_DIRECTORY = path.join(PROJECT_ROOT, "src/generated");
const EXTENSION_THEME_PATH = path.join(GENERATED_DIRECTORY, "theme.css");

const ACTIVATION_ATTRIBUTE = "data-sid-enhancement";
const ACTIVATION_VALUE = "enabled";
const ROOT_GATE = `:where(html[${ACTIVATION_ATTRIBUTE}="${ACTIVATION_VALUE}"])`;
const ATTRIBUTE_GATE = `:where([${ACTIVATION_ATTRIBUTE}="${ACTIVATION_VALUE}"])`;

const GENERATED_EXTENSION_NOTICE = `/*
 * GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Built from src/theme/modules/*.css for extension and mobile delivery.
 */`;

function readThemeModules() {
  const moduleNames = fs
    .readdirSync(MODULE_DIRECTORY)
    .filter((name) => name.endsWith(".css"))
    .sort((left, right) => left.localeCompare(right, "en"));

  if (moduleNames.length === 0) {
    throw new Error(`No CSS modules found in ${MODULE_DIRECTORY}`);
  }

  return moduleNames.map((name) => {
    const source = fs.readFileSync(path.join(MODULE_DIRECTORY, name), "utf8");
    if (!source.endsWith("\n")) {
      throw new Error(`${name} must end with a newline`);
    }
    return { name, source };
  });
}

function isInsideKeyframes(rule) {
  let parent = rule.parent;
  while (parent !== undefined) {
    if (parent.type === "atrule" && /keyframes$/i.test(parent.name)) return true;
    parent = parent.parent;
  }
  return false;
}

export function gateSelectorList(selectorList) {
  const parsed = selectorParser().astSync(selectorList);
  const gatedSelectors = [];

  for (const selector of parsed.nodes) {
    const value = selector.toString().trim();

    if (/^html(?=$|[.#:[\s>+~])/.test(value)) {
      gatedSelectors.push(value.replace(/^html/, `html${ATTRIBUTE_GATE}`));
      continue;
    }

    if (/^:root(?=$|[.#:[\s>+~])/.test(value)) {
      gatedSelectors.push(value.replace(/^:root/, `:root${ATTRIBUTE_GATE}`));
      continue;
    }

    if (value.startsWith("::")) {
      gatedSelectors.push(`${ROOT_GATE}${value}`, `${ROOT_GATE} ${value}`);
      continue;
    }

    if (value.startsWith("*")) {
      gatedSelectors.push(`${ROOT_GATE}${value.slice(1)}`, `${ROOT_GATE} ${value}`);
      continue;
    }

    gatedSelectors.push(`${ROOT_GATE} ${value}`);
  }

  return gatedSelectors.join(",\n");
}

function buildExtensionTheme(themeSource) {
  const root = postcss.parse(themeSource, { from: "src/theme/modules" });

  root.walkRules((rule) => {
    if (!isInsideKeyframes(rule)) {
      rule.selector = gateSelectorList(rule.selector);
    }
  });

  return `${GENERATED_EXTENSION_NOTICE}\n\n${root.toString().trimEnd()}\n`;
}

function buildOutputs() {
  const modules = readThemeModules();
  const themeSource = modules.map(({ source }) => source).join("");

  postcss.parse(themeSource, { from: "src/theme/modules" });

  return {
    extensionTheme: buildExtensionTheme(themeSource),
    moduleNames: modules.map(({ name }) => name),
  };
}

function assertCurrent(filePath, expected) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${path.relative(PROJECT_ROOT, filePath)} is missing`);
  }

  const actual = fs.readFileSync(filePath, "utf8");
  if (actual !== expected) {
    throw new Error(`${path.relative(PROJECT_ROOT, filePath)} is stale; run npm run build:theme`);
  }
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const outputs = buildOutputs();

  if (checkOnly) {
    assertCurrent(EXTENSION_THEME_PATH, outputs.extensionTheme);
    console.log(`Theme check passed: generated CSS matches ${outputs.moduleNames.length} modules.`);
    return;
  }

  fs.mkdirSync(GENERATED_DIRECTORY, { recursive: true });
  fs.writeFileSync(EXTENSION_THEME_PATH, outputs.extensionTheme);
  console.log(`Built generated theme CSS from ${outputs.moduleNames.length} modules.`);
}

main();

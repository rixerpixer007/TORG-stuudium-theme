import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const BRAND_DIRECTORY = path.join(PROJECT_ROOT, "assets/brand");
const EXTENSION_ICON_DIRECTORY = path.join(PROJECT_ROOT, "public/icons");
const ANDROID_FOREGROUND_PATH = path.join(
  PROJECT_ROOT,
  "apps/android/app/src/main/res/drawable-nodpi/ic_app_foreground.png",
);

const MASTER_SIZE = 1024;
const ANDROID_FOREGROUND_SIZE = 700;
const ANDROID_FOREGROUND_PADDING = (MASTER_SIZE - ANDROID_FOREGROUND_SIZE) / 2;
const EXTENSION_ICON_SIZES = [16, 32, 48, 128];
const PNG_OPTIONS = {
  adaptiveFiltering: false,
  compressionLevel: 9,
  palette: false,
  progressive: false,
};

const DARK_MASTER_PATH = path.join(BRAND_DIRECTORY, "sinu-stuudium-dark.png");
const LIGHT_MASTER_PATH = path.join(BRAND_DIRECTORY, "sinu-stuudium-light.png");
const MARK_MASTER_PATH = path.join(BRAND_DIRECTORY, "sinu-stuudium-mark.png");

async function validateMaster(filePath, { requireAlpha = false } = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${path.relative(PROJECT_ROOT, filePath)} is missing`);
  }

  const metadata = await sharp(filePath).metadata();
  const relativePath = path.relative(PROJECT_ROOT, filePath);

  if (metadata.format !== "png") {
    throw new Error(`${relativePath} must be a PNG`);
  }
  if (metadata.width !== MASTER_SIZE || metadata.height !== MASTER_SIZE) {
    throw new Error(`${relativePath} must be ${MASTER_SIZE} x ${MASTER_SIZE} pixels`);
  }
  if (requireAlpha && !metadata.hasAlpha) {
    throw new Error(`${relativePath} must have a transparent alpha channel`);
  }
}

async function buildOutputs() {
  await Promise.all([
    validateMaster(DARK_MASTER_PATH),
    validateMaster(LIGHT_MASTER_PATH),
    validateMaster(MARK_MASTER_PATH, { requireAlpha: true }),
  ]);

  const extensionIcons = await Promise.all(
    EXTENSION_ICON_SIZES.map(async (size) => ({
      data: await sharp(DARK_MASTER_PATH)
        .resize(size, size, { fit: "fill", kernel: sharp.kernel.lanczos3 })
        .png(PNG_OPTIONS)
        .toBuffer(),
      filePath: path.join(EXTENSION_ICON_DIRECTORY, `icon-${size}.png`),
    })),
  );

  const androidForeground = await sharp(MARK_MASTER_PATH)
    .resize(ANDROID_FOREGROUND_SIZE, ANDROID_FOREGROUND_SIZE, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .extend({
      top: ANDROID_FOREGROUND_PADDING,
      bottom: ANDROID_FOREGROUND_PADDING,
      left: ANDROID_FOREGROUND_PADDING,
      right: ANDROID_FOREGROUND_PADDING,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png(PNG_OPTIONS)
    .toBuffer();

  return [...extensionIcons, { data: androidForeground, filePath: ANDROID_FOREGROUND_PATH }];
}

function assertCurrent(filePath, expected) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${path.relative(PROJECT_ROOT, filePath)} is missing`);
  }

  const actual = fs.readFileSync(filePath);
  if (!actual.equals(expected)) {
    throw new Error(`${path.relative(PROJECT_ROOT, filePath)} is stale; run npm run build:brand`);
  }
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const outputs = await buildOutputs();

  if (checkOnly) {
    for (const { data, filePath } of outputs) assertCurrent(filePath, data);
    console.log(`Brand check passed: ${outputs.length} platform images are current.`);
    return;
  }

  fs.mkdirSync(EXTENSION_ICON_DIRECTORY, { recursive: true });
  fs.mkdirSync(path.dirname(ANDROID_FOREGROUND_PATH), { recursive: true });
  for (const { data, filePath } of outputs) fs.writeFileSync(filePath, data);

  console.log(
    `Built ${EXTENSION_ICON_SIZES.length} extension icons and the Android adaptive-icon foreground.`,
  );
}

await main();

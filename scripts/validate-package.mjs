import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const OUTPUT_DIRECTORY = path.join(PROJECT_ROOT, ".output");
const BUILD_DIRECTORY = path.join(OUTPUT_DIRECTORY, "chrome-mv3");
const packageMetadata = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"),
);
const ARCHIVE_NAME = `torg-stuudium-enhancement-${packageMetadata.version}-chrome.zip`;
const ARCHIVE_PATH = path.join(OUTPUT_DIRECTORY, ARCHIVE_NAME);

function walkFiles(directory, base = directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walkFiles(absolutePath, base)
      : [path.relative(base, absolutePath).split(path.sep).join("/")];
  });
}

function listZipEntries(buffer) {
  const endSignature = 0x06054b50;
  let endOffset = -1;
  for (
    let offset = buffer.length - 22;
    offset >= Math.max(0, buffer.length - 65_557);
    offset -= 1
  ) {
    if (buffer.readUInt32LE(offset) === endSignature) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error("ZIP end-of-central-directory record was not found");

  const entryCount = buffer.readUInt16LE(endOffset + 10);
  let offset = buffer.readUInt32LE(endOffset + 16);
  const entries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central-directory entry at offset ${offset}`);
    }
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    entries.push(name);
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

if (!fs.existsSync(ARCHIVE_PATH)) {
  throw new Error(`Release archive is missing: ${ARCHIVE_NAME}`);
}

const archiveEntries = listZipEntries(fs.readFileSync(ARCHIVE_PATH))
  .filter((entry) => !entry.endsWith("/"))
  .sort();
const buildEntries = walkFiles(BUILD_DIRECTORY).sort();

if (JSON.stringify(archiveEntries) !== JSON.stringify(buildEntries)) {
  throw new Error("Release archive contents do not exactly match the validated production build");
}

for (const entry of archiveEntries) {
  if (entry.startsWith("/") || entry.split("/").includes("..")) {
    throw new Error(`Unsafe archive path: ${entry}`);
  }
  if (/^(?:\.env|src\/|docs\/)|(?:^|\/)node_modules\/|\.map$/u.test(entry)) {
    throw new Error(`Development or sensitive file found in archive: ${entry}`);
  }
}

console.log(`Validated ${ARCHIVE_NAME}: ${archiveEntries.length} intended files only.`);

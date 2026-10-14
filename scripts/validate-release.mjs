import { readFileSync, existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(join(dirname(fileURLToPath(import.meta.url)), ".."));
const read = (path) => readFileSync(join(root, path), "utf8");
const fail = (message) => {
  console.error(`ERRO: ${message}`);
  process.exitCode = 1;
};

const version = read("VERSION").trim();
const expected = `v${version}`;
const requiredFiles = [
  "index.html",
  "src/game.js",
  "src/style.css",
  "README.md",
  "README_EN.md",
  "PRIVACY.md",
  "docs/BETA_TESTING.md",
  ".github/ISSUE_TEMPLATE/bug_report.md",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) fail(`arquivo obrigatório ausente: ${file}`);
}

const versionedFiles = [
  "index.html",
  "README.md",
  "README_EN.md",
  "docs/BETA_TESTING.md",
  ".github/ISSUE_TEMPLATE/bug_report.md",
];
for (const file of versionedFiles) {
  if (!read(file).includes(expected)) fail(`${file} não menciona ${expected}`);
}

const html = read("index.html");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicates.length) fail(`IDs HTML duplicados: ${duplicates.join(", ")}`);

const requiredIds = [
  "screen-hub",
  "screen-play",
  "screen-game",
  "play-enter",
  "personal-td-canvas",
  "td-money",
  "td-start",
  "td-upgrade-bar",
  "pause-menu",
  "menu-export-save",
  "menu-import-save",
  "result-screen",
];
for (const id of requiredIds) {
  if (!ids.includes(id)) fail(`controle essencial ausente no HTML: #${id}`);
}

const localRefs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((ref) => !/^(?:https?:|mailto:|#)/i.test(ref));
for (const ref of localRefs) {
  if (ref.startsWith("/")) {
    fail(`caminho absoluto incompatível com itch.io: ${ref}`);
    continue;
  }
  const clean = decodeURIComponent(ref.split(/[?#]/, 1)[0]);
  if (clean && !existsSync(join(root, clean))) fail(`recurso referenciado não existe: ${ref}`);
}

if (!html.includes('id="td-money"') || !html.includes("salmões")) {
  fail("HUD da partida não apresenta a carteira de salmões");
}

if (!process.exitCode) console.log(`OK — release ${expected} validada para empacotamento HTML5.`);

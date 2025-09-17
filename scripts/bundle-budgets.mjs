/*
  Vérifie les budgets de bundle sur un build Next.js (App Router).
  - Calcule la taille gzip des chunks JS. Peut vérifier une page spécifique ou toutes les pages.
  - Échoue si la taille dépasse les seuils.

  Variables d'env (optionnelles):
    - BUNDLE_PAGE: page à vérifier ("/page") ou "ALL" (par défaut: ALL)
    - BUNDLE_BUDGET_FIRSTLOAD_KB: seuil pour la page (par défaut 250)
    - BUNDLE_BUDGET_CHUNK_KB: seuil par chunk individuel (par défaut 160)

  Usage: npm run build && node scripts/bundle-budgets.mjs
*/

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const NEXT_DIR = ".next";
const APP_MANIFEST = path.join(NEXT_DIR, "app-build-manifest.json");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function gzipSize(bufferOrString) {
  const buf = Buffer.isBuffer(bufferOrString) ? bufferOrString : Buffer.from(bufferOrString);
  return zlib.gzipSync(buf).length; // bytes
}

function formatKB(bytes) {
  return Math.round((bytes / 1024) * 10) / 10; // 0.1 KB précision
}

function ensureBuild() {
  if (!fs.existsSync(APP_MANIFEST)) {
    console.error("[bundle] Fichier manquant:", APP_MANIFEST);
    console.error("[bundle] Lancez d'abord: npm run build");
    process.exit(2);
  }
}

function getAssetPathFromChunkName(chunkName) {
  // Les manifestes listent des chemins relatifs à ".next"
  return path.join(NEXT_DIR, chunkName);
}

function isJsAsset(filename) {
  return filename.endsWith(".js") || filename.endsWith(".mjs");
}

function unique(array) {
  return Array.from(new Set(array));
}

ensureBuild();

const pageToCheck = process.env.BUNDLE_PAGE || "ALL";
const BUDGET_FIRSTLOAD_KB = Number(process.env.BUNDLE_BUDGET_FIRSTLOAD_KB || 250);
const BUDGET_CHUNK_KB = Number(process.env.BUNDLE_BUDGET_CHUNK_KB || 160);

const manifest = readJson(APP_MANIFEST);
const pages = manifest.pages || {};

const allPages = Object.keys(pages).filter((p) => p.startsWith("/"));
const targets = pageToCheck === "ALL" ? allPages : [pageToCheck];

let anyFailure = false;
for (const page of targets) {
  if (!pages[page]) {
    console.error(`[bundle] Page introuvable: ${page}`);
    anyFailure = true;
    continue;
  }

  const chunkNames = pages[page].filter(isJsAsset);
  const assetPaths = unique(chunkNames.map(getAssetPathFromChunkName));

  let firstLoadBytes = 0;
  let failures = [];

  for (const assetPath of assetPaths) {
    if (!fs.existsSync(assetPath)) {
      console.warn("[bundle] Fichier introuvable:", assetPath);
      continue;
    }
    const content = fs.readFileSync(assetPath);
    const gzBytes = gzipSize(content);
    firstLoadBytes += gzBytes;
    const gzKB = formatKB(gzBytes);
    if (gzKB > BUDGET_CHUNK_KB) {
      failures.push(
        `[chunk] ${assetPath.replace(NEXT_DIR + path.sep, "")} = ${gzKB} KB (> ${BUDGET_CHUNK_KB} KB)`,
      );
    }
  }

  const firstLoadKB = formatKB(firstLoadBytes);
  console.log(`\n[bundle] Page: ${page}`);
  console.log(`[bundle] First Load gzip ≈ ${firstLoadKB} KB (budget ${BUDGET_FIRSTLOAD_KB} KB)`);
  failures.forEach((f) => console.error("[bundle]", f));

  if (firstLoadKB > BUDGET_FIRSTLOAD_KB) {
    console.error(`[bundle] ÉCHEC: First Load gzip dépasse ${BUDGET_FIRSTLOAD_KB} KB`);
    anyFailure = true;
  }
  if (failures.length > 0) {
    console.error("[bundle] ÉCHEC: un ou plusieurs chunks dépassent le budget");
    anyFailure = true;
  }
}

if (anyFailure) {
  process.exit(1);
}

console.log("\n[bundle] OK: budgets respectés pour toutes les pages vérifiées");
process.exit(0);

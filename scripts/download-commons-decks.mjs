/**
 * Download full-resolution card images from Wikimedia Commons.
 * - Waite: Category:Rider-Waite-Smith tarot deck (Geldard) — 78 × ~2100×3600 PNG
 * - Lenormand: Category:Jeu de cartes divinatoire, dit "Petit Lenormand"… — map by card # in wikitext
 */
import { spawn } from "child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cardsDir = join(root, "public", "cards");
const API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "TarotOracle/1.0 (educational; local dev)";

mkdirSync(cardsDir, { recursive: true });

const THUMB_WIDTH = Number(process.env.CARD_THUMB_WIDTH || 1600);
const FETCH_OPTS = {
  headers: { "User-Agent": USER_AGENT },
  signal: AbortSignal.timeout(600_000),
};

async function api(params, retries = 4) {
  const url = `${API}?${new URLSearchParams({
    format: "json",
    ...params,
  })}`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, FETCH_OPTS);
      if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
      return res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function listCategoryFiles(categoryTitle, limit = 500) {
  const members = [];
  let cmcontinue;
  do {
    const data = await api({
      action: "query",
      list: "categorymembers",
      cmtitle: categoryTitle,
      cmtype: "file",
      cmlimit: String(Math.min(limit, 100)),
      ...(cmcontinue ? { cmcontinue } : {}),
    });
    members.push(...(data.query?.categorymembers ?? []));
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue && members.length < limit);
  return members;
}

async function getImageUrls(titles) {
  const map = new Map();
  const batchSize = 40;
  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    const data = await api({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url|size",
      iiurlwidth: String(THUMB_WIDTH),
    });
    for (const page of Object.values(data.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info?.url) continue;
      const useThumb = THUMB_WIDTH > 0 && info.thumburl;
      map.set(page.title, {
        url: useThumb ? info.thumburl : info.url,
        width: useThumb ? info.thumbwidth : info.width,
        height: useThumb ? info.thumbheight : info.height,
        size: useThumb ? info.thumbsize : info.size,
      });
    }
  }
  return map;
}

function shouldSkipDownload(dest, minBytes = 80_000) {
  if (!existsSync(dest)) return false;
  try {
    const size = statSync(dest).size;
    if (size >= minBytes) return true;
    if (size > 5_000_000) return true;
    return false;
  } catch {
    return false;
  }
}

function curlDownload(url, dest) {
  return new Promise((resolve, reject) => {
    const args = [
      "-L",
      "--fail",
      "--retry",
      "6",
      "--retry-delay",
      "3",
      "--connect-timeout",
      "60",
      "--max-time",
      "600",
      "-A",
      USER_AGENT,
      "-o",
      dest,
      url,
    ];
    const proc = spawn("curl", args, { stdio: ["ignore", "pipe", "pipe"] });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error(`curl exit ${code}`));
      else resolve(statSync(dest).size);
    });
  });
}

async function downloadFile(url, dest, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      return await curlDownload(url, dest);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
    }
  }
}

function normTitle(t) {
  return t
    .replace(/^File:/i, "")
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
}

function waiteFileTitles(nameEn) {
  const suffix = " (rider-waite smith tarot deck).png";
  const list = [`File:${nameEn}${suffix}`];
  if (nameEn === "Ace of Swords") list.push(`File:One of Swords${suffix}`);
  if (nameEn === "Ace of Pentacles") list.push(`File:One of Pentacles${suffix}`);
  return list;
}

async function downloadWaite() {
  console.log("\n=== Waite (78) — Geldard hi-res ===");
  const deck = JSON.parse(
    readFileSync(join(root, "src/data/waite-deck.json"), "utf8")
  );
  const members = await listCategoryFiles(
    "Category:Rider-Waite-Smith tarot deck (Geldard)"
  );
  const titleToMember = new Map(members.map((m) => [normTitle(m.title), m]));
  const allTitles = members.map((m) => m.title);
  const urlMap = await getImageUrls(allTitles);

  let ok = 0;
  for (const card of deck) {
    const dest = join(cardsDir, `${card.id}.png`);
    const member = waiteFileTitles(card.nameEn)
      .map((t) => titleToMember.get(normTitle(t)))
      .find(Boolean);
    if (!member) {
      console.error(`  MISSING ${card.id} (${card.nameEn})`);
      continue;
    }
    const info = urlMap.get(member.title);
    if (!info) {
      console.error(`  NO URL ${card.id}`);
      continue;
    }
    if (shouldSkipDownload(dest)) {
      card.image = `/cards/${card.id}.png`;
      console.log(`  ${card.id}  (skipped, already exists)`);
      ok++;
      continue;
    }
    const bytes = await downloadFile(info.url, dest);
    card.image = `/cards/${card.id}.png`;
    const kb = bytes / 1024;
    console.log(
      `  ${card.id}  ${info.width}×${info.height}  ${kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`}`
    );
    ok++;
  }
  writeFileSync(
    join(root, "src/data/waite-deck.json"),
    JSON.stringify(deck, null, 2) + "\n",
    "utf8"
  );
  console.log(`Waite: ${ok}/${deck.length} downloaded.`);
  return ok;
}

/** French / English labels on BnF Petit Lenormand scans → card number 1–36 */
const LENORMAND_LABELS = [
  [/cavalier|le\s+chevalier|\brider\b|reiter/i, 1],
  [/tr[eè]fle|clover/i, 2],
  [/navire|ship|schiff/i, 3],
  [/maison|house/i, 4],
  [/arbre|tree/i, 5],
  [/nuage|cloud/i, 6],
  [/serpent|snake/i, 7],
  [/cercueil|coffin/i, 8],
  [/bouquet/i, 9],
  [/faux|scythe/i, 10],
  [/fouet|whip|b[^a-z]*ton/i, 11],
  [/oiseau|bird/i, 12],
  [/enfant|child/i, 13],
  [/renard|fox/i, 14],
  [/ours|bear/i, 15],
  [/etoile|étoile|star/i, 16],
  [/cigogne|stork/i, 17],
  [/chien|dog/i, 18],
  [/tour|tower/i, 19],
  [/jardin|garden/i, 20],
  [/montagne|mountain/i, 21],
  [/carrefour|crossroad/i, 22],
  [/souris|mice|mouse/i, 23],
  [/c[oœ]ur|heart/i, 24],
  [/bague|anneau|ring/i, 25],
  [/livre|book/i, 26],
  [/lettre|letter/i, 27],
  [/\bl'?homme\b|\bman\b|der\s+mann/i, 28],
  [/\bl?a\s+femme\b|\bwoman\b|die\s+frau/i, 29],
  [/lys|lily|lilie/i, 30],
  [/soleil|sun/i, 31],
  [/lune|moon/i, 32],
  [/clef|clé|key/i, 33],
  [/poisson|fish/i, 34],
  [/ancre|anchor/i, 35],
  [/croix|cross/i, 36],
];

async function getWikitext(title) {
  const data = await api({
    action: "parse",
    page: title,
    prop: "wikitext",
    formatversion: "2",
  });
  return data.parse?.wikitext ?? "";
}

function detectLenormandNumber(wikitext, scanIndex) {
  const text = wikitext.replace(/<[^>]+>/g, " ").toLowerCase();
  for (const [re, num] of LENORMAND_LABELS) {
    if (re.test(text)) return num;
  }
  const numMatch = text.match(
    /(?:n[°o]?\s*|num[eé]ro\s*|carte\s*)([1-9]|[12][0-9]|3[0-6])\b/i
  );
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

async function downloadLenormand() {
  console.log(
    "\n=== Lenormand (36) — Game of Hope sheet (see scripts/split-lenormand-game-of-hope.mjs) ==="
  );
  const { spawn: sp } = await import("child_process");
  return new Promise((resolve, reject) => {
    const proc = sp(
      process.execPath,
      [join(__dirname, "split-lenormand-game-of-hope.mjs")],
      { stdio: "inherit", cwd: root }
    );
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0 ? resolve(36) : reject(new Error(`split script exit ${code}`))
    );
  });
}

const mode = process.argv[2] || "all";
let waiteOk = 78;
let lenormandOk = 0;

if (mode === "waite" || mode === "all") {
  waiteOk = await downloadWaite();
}
if (mode === "lenormand" || mode === "all") {
  lenormandOk = await downloadLenormand();
}

if (waiteOk < 78) {
  console.error("\nWaite incomplete.");
  process.exit(1);
}
if (lenormandOk < 36) {
  console.warn(
    `\nLenormand only ${lenormandOk}/36 — may need manual mapping. Waite is complete.`
  );
}

console.log("\nDone. Refresh the app to see sharper Waite cards.");

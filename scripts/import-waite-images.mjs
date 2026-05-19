/**
 * Copy Rider–Waite PNGs from Desktop folder into public/cards/
 * and update waite-deck.json image paths.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourceDir =
  "C:\\Users\\LEGION\\Desktop\\Category_Rider-Waite-Smith tarot deck (Geldard) - Wikimedia Commons_files";
const cardsDir = join(root, "public", "cards");
const deckPath = join(root, "src", "data", "waite-deck.json");

const SUFFIX = "_(Rider-Waite_Smith_tarot_deck).png";

function candidatesForNameEn(nameEn) {
  const base = nameEn.replace(/ /g, "_");
  const list = [`${base}${SUFFIX}`];
  if (nameEn === "Ace of Swords") list.push(`One_of_Swords${SUFFIX}`);
  if (nameEn === "Ace of Pentacles") list.push(`One_of_Pentacles${SUFFIX}`);
  return list;
}

mkdirSync(cardsDir, { recursive: true });

const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const missing = [];

for (const card of deck) {
  const dest = join(cardsDir, `${card.id}.png`);
  const candidates = candidatesForNameEn(card.nameEn);
  let src = null;
  for (const file of candidates) {
    const full = join(sourceDir, file);
    if (existsSync(full)) {
      src = full;
      break;
    }
  }
  if (!src) {
    missing.push({ id: card.id, nameEn: card.nameEn, tried: candidates });
    continue;
  }
  copyFileSync(src, dest);
  card.image = `/cards/${card.id}.png`;
}

writeFileSync(deckPath, JSON.stringify(deck, null, 2) + "\n", "utf8");

console.log(`Copied ${deck.length - missing.length} / ${deck.length} cards to public/cards/`);
if (missing.length) {
  console.error("Missing:", missing);
  process.exit(1);
}

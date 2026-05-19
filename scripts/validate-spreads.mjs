/**
 * 校验所有牌阵：抽牌数量、翻牌顺序、解读字段完整性
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const waite = JSON.parse(
  readFileSync(join(root, "src/data/waite-deck.json"), "utf8")
);

// 动态 import spread layouts via built JSON - read spreadLayouts as text and eval cardCount
const layoutSrc = readFileSync(
  join(root, "src/lib/spreadLayouts.ts"),
  "utf8"
);

const spreadIds = [
  "single",
  "three",
  "five",
  "relationship",
  "horseshoe",
  "celtic",
  "cross",
  "star",
  "decision",
  "moon_cycle",
  "twelve_house",
  "soul_journey",
];

const flipOrders = {
  single: [0],
  three: [0, 1, 2],
  five: [0, 1, 2, 3, 4],
  relationship: [2, 0, 1, 3, 4],
  horseshoe: [0, 1, 2, 3, 4, 5, 6],
  celtic: [0, 1, 4, 2, 3, 5, 6, 7, 8, 9],
  cross: [0, 1, 2, 3, 4],
  star: [0, 1, 2, 3, 4, 5],
  decision: [2, 0, 1, 3, 4],
  moon_cycle: [0, 1, 2, 3, 4, 5, 6, 7],
  twelve_house: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  soul_journey: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawSpread(spreadId, count) {
  const shuffled = shuffle(waite);
  return shuffled.slice(0, count);
}

let failed = 0;

for (const id of spreadIds) {
  const match = layoutSrc.match(
    new RegExp(`${id}:\\s*\\{[\\s\\S]*?cardCount:\\s*(\\d+)`)
  );
  const cardCount = match ? parseInt(match[1], 10) : 0;
  const order = flipOrders[id];

  if (!cardCount) {
    console.error(`FAIL ${id}: cardCount not found`);
    failed++;
    continue;
  }
  if (!order || order.length !== cardCount) {
    console.error(
      `FAIL ${id}: flipOrder length ${order?.length} != ${cardCount}`
    );
    failed++;
    continue;
  }

  const drawn = drawSpread(id, cardCount);
  if (drawn.length !== cardCount) {
    console.error(`FAIL ${id}: drew ${drawn.length} cards`);
    failed++;
    continue;
  }

  let meaningOk = true;
  for (const card of drawn) {
    if (!card.upright?.summary || !card.upright?.detail) {
      meaningOk = false;
      break;
    }
  }
  if (!meaningOk) {
    console.error(`FAIL ${id}: missing upright meanings`);
    failed++;
    continue;
  }

  console.log(`OK ${id}: ${cardCount} cards, flip order [${order.join(",")}]`);
}

if (failed > 0) {
  process.exit(1);
}
console.log("\nAll spreads validated.");

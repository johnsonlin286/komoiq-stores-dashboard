// Generates src/data/layar-b.json (Layar B sample data) from the master
// fixtures src/data/stores.json and src/data/products.json, following the
// "Data contoh" data contract in the brief: Toko, Produk, Stok, dan Saran.
// Deterministic (seeded) so the output is stable across runs.
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mulberry32, pick, pickWeighted, randomInt, formatRupiah, PRICE_RANGE } from "./lib/sample-data.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, "..", "src", "data");

const stores = JSON.parse(readFileSync(path.join(dataDir, "stores.json"), "utf8"));
const products = JSON.parse(readFileSync(path.join(dataDir, "products.json"), "utf8"));

const FRESH_LEVELS = [
  { id: "fresh-1", weight: 0.5 },
  { id: "fresh-2", weight: 0.3 },
  { id: "fresh-3", weight: 0.2 },
];
const OTHER_LEVELS = [
  { id: "other-2w", weight: 0.4 },
  { id: "other-1m", weight: 0.27 },
  { id: "other-3m", weight: 0.2 },
  { id: "other-6m", weight: 0.13 },
];

const DISCOUNT_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const DISCOUNT_SIZES = [20, 30, 40, 50];

const random = mulberry32(20270115);

function pickReplacement(product) {
  const sameCategory = products.filter(
    (candidate) => candidate.category === product.category && candidate.sku !== product.sku,
  );
  if (sameCategory.length === 0) return `${product.name} (varian lain)`;
  return pick(random, sameCategory).name;
}

function bestOtherStore(currentStoreId) {
  const others = [...stores]
    .filter((store) => store.id !== currentStoreId)
    .sort((a, b) => a.wastePercent - b.wastePercent);
  return others[0];
}

function pickNextAction(currentStoreId) {
  if (random() < 0.55) {
    const target = bestOtherStore(currentStoreId);
    return `Pindah ke ${target.name.replace("Ranch Market ", "")}`;
  }
  return `Diskon ${pick(random, DISCOUNT_SIZES)}% mulai ${pick(random, DISCOUNT_DAYS)}`;
}

const levelTiles = [];
const flaggedProducts = [];

for (const store of stores) {
  const tileCounters = new Map();

  for (const product of products) {
    const flagProbability = product.fresh ? 0.5 : 0.45;
    if (random() >= flagProbability) continue;

    const levelId = pickWeighted(random, product.fresh ? FRESH_LEVELS : OTHER_LEVELS);
    const [min, max] = PRICE_RANGE[product.category];
    const unitPrice = randomInt(random, min, max);
    const stock = product.fresh ? randomInt(random, 3, 40) : randomInt(random, 5, 60);
    const value = unitPrice * stock;

    const key = `${store.id}:${levelId}`;
    const current = tileCounters.get(key) ?? { productCount: 0, value: 0 };
    tileCounters.set(key, {
      productCount: current.productCount + 1,
      value: current.value + value,
    });

    flaggedProducts.push({
      storeId: store.id,
      levelId,
      sku: product.sku,
      productName: product.name,
      stock,
      valueLabel: formatRupiah(value),
      replacement: pickReplacement(product),
      nextAction: pickNextAction(store.id),
    });
  }

  for (const [key, totals] of tileCounters) {
    const [storeId, levelId] = key.split(":");
    levelTiles.push({
      storeId,
      levelId,
      productCount: totals.productCount,
      valueLabel: formatRupiah(totals.value),
    });
  }
}

const storeSummaries = stores.map((store) => {
  const storeValue = levelTiles
    .filter((tile) => tile.storeId === store.id)
    .reduce((sum, tile) => sum + parseValueLabel(tile.valueLabel), 0);

  return {
    id: store.id,
    name: store.name,
    wastePercent: store.wastePercent,
    shelfAvailability: store.shelfAvailability,
    slowStockValueLabel: formatRupiah(storeValue),
  };
});

function parseValueLabel(label) {
  const match = label.match(/Rp ([\d,]+) jt/);
  if (match) return Number.parseFloat(match[1].replace(",", ".")) * 1_000_000;
  const digits = label.replace(/[^\d]/g, "");
  return Number.parseInt(digits || "0", 10);
}

const output = {
  stores: storeSummaries,
  levelTiles,
  products: flaggedProducts,
};

writeFileSync(path.join(dataDir, "layar-b.json"), `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Generated layar-b.json: ${storeSummaries.length} toko, ${levelTiles.length} level tiles, ${flaggedProducts.length} produk bermasalah.`,
);

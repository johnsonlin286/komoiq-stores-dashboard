// Generates src/data/layar-a.json (Layar A sample data) by drawing tasks
// directly from HOME_STORE_ID's flagged products in src/data/layar-b.json
// (which must already exist — run generate-layar-b-data.mjs first, or use
// generate-sample-data.mjs to run both in order).
//
// Sourcing tasks from Layar B's own product rows (same sku + levelId, not a
// separate random pick) is what lets the two dashboards simulate being
// connected: see src/lib/linked-tasks.ts and src/hooks/use-resolved-products.ts,
// which confirm a Layar A task against this exact crosswalk.
//
// Every one of HOME_STORE_ID's flagged products becomes a task (not just a
// sample) — otherwise Layar A's "Segar berisiko" / "Tidak laku" counts would
// never match the sum of Layar B's level tiles for that store.
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mulberry32, pick, shuffle, formatPercent, randomInt } from "./lib/sample-data.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, "..", "src", "data");

const stores = JSON.parse(readFileSync(path.join(dataDir, "stores.json"), "utf8"));
const products = JSON.parse(readFileSync(path.join(dataDir, "products.json"), "utf8"));
const layarB = JSON.parse(readFileSync(path.join(dataDir, "layar-b.json"), "utf8"));

// Must match HOME_STORE_ID in src/lib/linked-tasks.ts.
const HOME_STORE_ID = "pondok-indah";

const LEVEL_ORDER = ["fresh-1", "fresh-2", "fresh-3", "other-2w", "other-1m", "other-3m", "other-6m"];

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei"];

const random = mulberry32(20270115);

const store = stores.find((item) => item.id === HOME_STORE_ID);
if (!store) {
  throw new Error(`Store "${HOME_STORE_ID}" tidak ditemukan di stores.json`);
}

const productBySku = new Map(products.map((product) => [product.sku, product]));
const homeStoreProducts = layarB.products.filter((product) => product.storeId === HOME_STORE_ID);

function otherStore() {
  const candidates = stores.filter((item) => item.id !== HOME_STORE_ID);
  return pick(random, candidates);
}

function detailFor(levelId, qty) {
  switch (levelId) {
    case "fresh-1":
      return `Tidak terjual 1 hari, sisa ${qty}`;
    case "fresh-2":
      return `Tidak terjual 2 hari, sisa ${qty}`;
    case "fresh-3":
      return `Tidak terjual 3 hari, sisa ${qty}`;
    case "other-2w":
      return "Tidak terjual 14 hari";
    case "other-1m":
      return `Masih ada stok untuk ${randomInt(random, 5, 7)} minggu`;
    case "other-3m":
      return `Stok untuk ${randomInt(random, 4, 6)} bulan`;
    case "other-6m":
      return `Tidak laku sejak ${pick(random, MONTHS)}`;
    default:
      return "";
  }
}

function actionFor(levelId) {
  const roll = random();
  switch (levelId) {
    case "fresh-1":
    case "fresh-2":
    case "fresh-3":
      if (roll < 0.6) return { actionLabel: "Pindah ke rak murah", toLabel: "Rak Masak Hari Ini" };
      if (roll < 0.85) {
        const target = otherStore();
        return {
          actionLabel: `Pindah ke ${target.name.replace("Ranch Market ", "")}`,
          toLabel: target.name,
        };
      }
      return { actionLabel: "Cek di rak", toLabel: null };
    case "other-2w":
      return roll < 0.6
        ? { actionLabel: "Cek di rak", toLabel: null }
        : { actionLabel: "Stop pesan ulang", toLabel: null };
    case "other-1m":
      return { actionLabel: "Stop pesan ulang", toLabel: null };
    case "other-3m":
      return { actionLabel: "Retur ke pemasok", toLabel: "Pemasok" };
    case "other-6m":
      return { actionLabel: "Hapus dan ganti", toLabel: null };
    default:
      return { actionLabel: "Cek di rak", toLabel: null };
  }
}

let taskNumber = 0;
const tasks = [];

for (const levelId of LEVEL_ORDER) {
  const pool = shuffle(
    random,
    homeStoreProducts.filter((product) => product.levelId === levelId),
  );

  for (const bProduct of pool) {
    const product = productBySku.get(bProduct.sku);
    const qty = bProduct.stock;
    const { actionLabel, toLabel } = actionFor(levelId);

    taskNumber += 1;
    tasks.push({
      id: `tsk_${String(taskNumber).padStart(2, "0")}`,
      productName: bProduct.productName,
      sku: bProduct.sku,
      levelId,
      detail: detailFor(levelId, qty),
      actionLabel,
      quantityLabel: `${qty} ${product?.unit ?? "pcs"}`,
      fromLabel: store.name,
      toLabel,
    });
  }
}

const output = {
  storeName: store.name,
  wasteThisMonth: {
    value: formatPercent(store.wastePercent),
    detail: "dari penjualan bulan ini",
  },
  tasks,
  confirmations: [],
};

writeFileSync(path.join(dataDir, "layar-a.json"), `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `Generated layar-a.json: ${store.name}, ${tasks.length} tugas hari ini (dari ${homeStoreProducts.length} produk bermasalah di Layar B).`,
);

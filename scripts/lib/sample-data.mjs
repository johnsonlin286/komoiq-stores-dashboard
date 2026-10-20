// Shared helpers for the sample-data generator scripts, so Layar A and
// Layar B dummy data are built from the same master fixtures the same way.

// Seeded PRNG (mulberry32) so generated data is reproducible across runs.
export function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

export function pickWeighted(random, options) {
  const roll = random();
  let cursor = 0;
  for (const option of options) {
    cursor += option.weight;
    if (roll <= cursor) return option.id;
  }
  return options[options.length - 1].id;
}

export function randomInt(random, min, max) {
  return Math.floor(min + random() * (max - min + 1));
}

export function shuffle(random, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatPercent(value) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

export function formatRupiah(value) {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  return `Rp ${Math.round(value / 1000) * 1000}`.replace(/(\d)(?=(\d{3})+$)/g, "$1.");
}

export const PRICE_RANGE = {
  "Sayur & buah segar": [8000, 35000],
  "Dairy & chilled": [25000, 70000],
  "Roti & bakery": [20000, 45000],
  "Daging & seafood": [60000, 220000],
  "Grocery kering": [25000, 180000],
  Minuman: [15000, 60000],
  "Bumbu & saus": [20000, 90000],
  "Personal care": [20000, 70000],
  "Rumah tangga": [15000, 60000],
  "Pet care": [30000, 150000],
};

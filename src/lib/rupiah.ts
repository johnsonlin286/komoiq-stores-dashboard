export function parseRupiah(label: string) {
  const jutaMatch = label.match(/Rp\s([\d.,]+)\sjt/);
  if (jutaMatch) return Number.parseFloat(jutaMatch[1].replace(",", ".")) * 1_000_000;
  const digits = label.replace(/[^\d]/g, "");
  return Number.parseInt(digits || "0", 10);
}

export function formatRupiah(value: number) {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  }
  return `Rp ${Math.round(value / 1000) * 1000}`.replace(/(\d)(?=(\d{3})+$)/g, "$1.");
}

export function sumRupiahLabels(labels: string[]) {
  return formatRupiah(labels.reduce((sum, label) => sum + parseRupiah(label), 0));
}

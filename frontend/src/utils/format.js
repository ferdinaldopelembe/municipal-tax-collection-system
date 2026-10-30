export function formatMT(valor) {
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 2,
  })
    .format(valor)
    .replace("MZN", "MT")
    .replace(/\s+/g, " ")
    .trim();
}
/** Normaliza texto para búsqueda: minúsculas y sin tildes. */
export const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** true si la cancha coincide con el término (nombre, dirección, ciudad o descripción). */
export const matchesFieldSearch = (field, term) => {
  const q = normalizeText(term).trim();
  if (!q) return true;
  return [field.name, field.address, field.city, field.description].some((v) =>
    normalizeText(v).includes(q)
  );
};

export const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre (A–Z)" },
];

const priceOf = (f) => {
  const n = Number(f.pricePerHour);
  return Number.isFinite(n) ? n : 0;
};

/** Devuelve una copia ordenada (la lista de entrada ya viene por createdAt desc). */
export const sortFields = (list, sort) => {
  if (sort === "price-asc") return [...list].sort((a, b) => priceOf(a) - priceOf(b));
  if (sort === "price-desc") return [...list].sort((a, b) => priceOf(b) - priceOf(a));
  if (sort === "name") return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || "", "es"));
  return list;
};

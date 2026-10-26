const TOKENS: Record<string, { token: string; letter: string }> = {
  "grande-comore": { token: "var(--island-ngazidja)", letter: "N" },
  anjouan: { token: "var(--island-ndzuwani)", letter: "D" },
  moheli: { token: "var(--island-mwali)", letter: "M" },
};

/** Variable CSS de couleur d'île (texte lisible en clair et en sombre). */
export function islandColorVar(slug: string): string {
  return TOKENS[slug]?.token ?? "var(--muted-foreground)";
}
/** Couleur de texte lisible sur un fond hexadécimal (foncé sur jaune, blanc sinon). */
export function textOn(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#1a1600" : "#ffffff";
}
/** Lettre repère (pas de couleur seule) pour les marqueurs. */
export function islandLetter(slug: string): string {
  return TOKENS[slug]?.letter ?? "•";
}

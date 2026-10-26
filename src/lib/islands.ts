const TOKENS: Record<string, { token: string; letter: string }> = {
  "grande-comore": { token: "var(--island-ngazidja)", letter: "N" },
  anjouan: { token: "var(--island-ndzuwani)", letter: "D" },
  moheli: { token: "var(--island-mwali)", letter: "M" },
};

/** Variable CSS de couleur d'île (texte lisible en clair et en sombre). */
export function islandColorVar(slug: string): string {
  return TOKENS[slug]?.token ?? "var(--muted-foreground)";
}
/** Lettre repère (pas de couleur seule) pour les marqueurs. */
export function islandLetter(slug: string): string {
  return TOKENS[slug]?.letter ?? "•";
}

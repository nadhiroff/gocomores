/** Couleurs des îles telles que sur le drapeau (admin) : Mwali jaune, Ndzuwani rouge, Ngazidja bleu. */
const FLAG_ISLAND_VARS: Record<string, string> = {
  moheli: "var(--isle-moheli)",
  anjouan: "var(--isle-anjouan)",
  "grande-comore": "var(--isle-grande-comore)",
};

export function islandColor(island: { slug: string; color?: string }) {
  if (FLAG_ISLAND_VARS[island.slug]) return FLAG_ISLAND_VARS[island.slug];
  return island.color && /^#[0-9a-fA-F]{3,8}$/.test(island.color) ? island.color : "var(--primary)";
}

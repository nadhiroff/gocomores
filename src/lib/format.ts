const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const numFmt = new Intl.NumberFormat("fr-FR");
const avgFmt = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatDate = (d: Date) => dateFmt.format(d); // JJ/MM/AAAA
export const formatDateLong = (d: Date) => longFmt.format(d); // 10 octobre 2026
export const formatNumber = (n: number) => numFmt.format(n);
export const formatAverage = (n: number) => avgFmt.format(n); // 4,6

export const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

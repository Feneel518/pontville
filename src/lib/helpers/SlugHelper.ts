export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD") // handle accents
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // spaces → hyphen
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

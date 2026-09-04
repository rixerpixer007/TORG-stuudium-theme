export const STUUDIUM_ORIGINS = ["https://torg.ope.ee"] as const;

export const STUUDIUM_MATCHES = STUUDIUM_ORIGINS.map((origin) => `${origin}/*`);

export function isSupportedStuudiumUrl(value: string | URL): boolean {
  try {
    const url = value instanceof URL ? value : new URL(value);
    return (STUUDIUM_ORIGINS as readonly string[]).includes(url.origin);
  } catch {
    return false;
  }
}

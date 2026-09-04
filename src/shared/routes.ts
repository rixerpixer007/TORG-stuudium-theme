import { isSupportedStuudiumUrl } from "./sites";

export type StuudiumRouteKind =
  "dashboard" | "tera" | "suhtlus" | "subjects" | "settings" | "other" | "unsupported";

export interface StuudiumRoute {
  kind: StuudiumRouteKind;
  pathname: string;
  supported: boolean;
}

export function detectStuudiumRoute(value: string | URL): StuudiumRoute {
  let url: URL;

  try {
    url = value instanceof URL ? value : new URL(value);
  } catch {
    return { kind: "unsupported", pathname: "", supported: false };
  }

  if (!isSupportedStuudiumUrl(url)) {
    return { kind: "unsupported", pathname: url.pathname, supported: false };
  }

  const pathname = url.pathname;

  if (pathname === "/" || pathname.startsWith("/s/")) {
    return { kind: "dashboard", pathname, supported: true };
  }

  if (pathname === "/tera" || pathname.startsWith("/tera/")) {
    return { kind: "tera", pathname, supported: true };
  }

  if (pathname === "/suhtlus" || pathname.startsWith("/suhtlus/")) {
    return { kind: "suhtlus", pathname, supported: true };
  }

  if (pathname.startsWith("/subjects/") || pathname.startsWith("/subjectplans/")) {
    return { kind: "subjects", pathname, supported: true };
  }

  if (pathname.startsWith("/users/") || pathname.startsWith("/settings/")) {
    return { kind: "settings", pathname, supported: true };
  }

  return { kind: "other", pathname, supported: true };
}

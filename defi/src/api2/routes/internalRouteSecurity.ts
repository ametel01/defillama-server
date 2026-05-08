import path from "path";

const INTERNAL_SECRET_HEADER = "x-internal-secret";
const INTERNAL_SECRET_ENV_VAR = "LLAMA_INTERNAL_ROUTE_KEY";

export function getInternalDebugAuthError(
  headers: Record<string, any>,
  expectedSecret = process.env[INTERNAL_SECRET_ENV_VAR]
) {
  if (!expectedSecret) {
    return { statusCode: 503, message: "Internal route unavailable" };
  }

  const providedSecret = headers?.[INTERNAL_SECRET_HEADER];
  if (!providedSecret) {
    return { statusCode: 401, message: "Unauthorized" };
  }

  if (Array.isArray(providedSecret) || providedSecret !== expectedSecret) {
    return { statusCode: 403, message: "Forbidden" };
  }

  return null;
}

export function normalizeDebugPGCacheKey(routerPath: string) {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(routerPath ?? "");
  } catch {
    return null;
  }

  const routeRelativePath = decodedPath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!routeRelativePath) return null;

  const pathSegments = routeRelativePath.split("/");
  if (pathSegments.some((segment) => segment === "..")) return null;

  const normalizedPath = path.posix.normalize(`/${routeRelativePath}`);
  if (normalizedPath === "/" || normalizedPath.includes("/../") || normalizedPath.endsWith("/..")) return null;

  return normalizedPath;
}

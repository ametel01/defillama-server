import { getInternalDebugAuthError, normalizeDebugPGCacheKey } from "./internalRouteSecurity";

describe("getInternalDebugAuthError", () => {
  const expectedSecret = "internal-secret";

  it("fails closed when the internal secret is not configured", () => {
    expect(getInternalDebugAuthError({}, undefined)).toEqual({
      statusCode: 503,
      message: "Internal route unavailable",
    });
  });

  it("rejects requests without the internal secret header", () => {
    expect(getInternalDebugAuthError({}, expectedSecret)).toEqual({
      statusCode: 401,
      message: "Unauthorized",
    });
  });

  it("rejects requests with the wrong internal secret", () => {
    expect(getInternalDebugAuthError({ "x-internal-secret": "wrong" }, expectedSecret)).toEqual({
      statusCode: 403,
      message: "Forbidden",
    });
  });

  it("accepts requests with the expected internal secret", () => {
    expect(getInternalDebugAuthError({ "x-internal-secret": expectedSecret }, expectedSecret)).toBeNull();
  });
});

describe("normalizeDebugPGCacheKey", () => {
  it("normalizes route cache keys to a slash-prefixed path", () => {
    expect(normalizeDebugPGCacheKey("/tvl-cache-daily-v0.11/aave")).toBe("/tvl-cache-daily-v0.11/aave");
    expect(normalizeDebugPGCacheKey("dimensions//fees")).toBe("/dimensions/fees");
  });

  it("rejects empty cache keys", () => {
    expect(normalizeDebugPGCacheKey("")).toBeNull();
    expect(normalizeDebugPGCacheKey("/")).toBeNull();
  });

  it("rejects traversal segments before cache access", () => {
    expect(normalizeDebugPGCacheKey("/../metadata")).toBeNull();
    expect(normalizeDebugPGCacheKey("/tvl-cache/../metadata")).toBeNull();
    expect(normalizeDebugPGCacheKey("/tvl-cache/%2e%2e/metadata")).toBeNull();
    expect(normalizeDebugPGCacheKey("\\..\\metadata")).toBeNull();
  });

  it("rejects malformed encoded paths", () => {
    expect(normalizeDebugPGCacheKey("/%E0%A4%A")).toBeNull();
  });
});

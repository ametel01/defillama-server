import { deleteFromPGCache } from "../cache/file-cache";
import * as HyperExpress from "hyper-express";
import { errorResponse } from "./utils";
import { clearDimensionsCacheV2 } from "../utils/dimensionsUtils";
import { getInternalDebugAuthError, normalizeDebugPGCacheKey } from "./internalRouteSecurity";

export function setInternalRoutes(router: HyperExpress.Router, _routerBasePath: string) {
  router.delete("/debug-pg/*", debugHandler);

  async function debugHandler(req: any, res: any) {
    const authError = getInternalDebugAuthError(req.headers);
    if (authError) return errorResponse(res, authError.message, { statusCode: authError.statusCode });

    const routerPath = normalizeDebugPGCacheKey(req.path.split("debug-pg")[1]);
    if (!routerPath) return errorResponse(res, "Invalid cache path", { statusCode: 400 });

    try {
      switch (req.method) {
        case "DELETE":
          if (routerPath === "/clear-dimensions-cache") {
            await clearDimensionsCacheV2();
          } else await deleteFromPGCache(routerPath);
          return res.json({ success: true });
        default:
          throw new Error("Unsupported method");
      }
    } catch (e) {
      console.error(e);
      return errorResponse(res, "Internal server error", { statusCode: 500 });
    }
  }
}

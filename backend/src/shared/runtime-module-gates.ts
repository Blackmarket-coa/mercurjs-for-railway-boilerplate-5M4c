import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  PHASE0_FEATURE_FLAGS,
  type Phase0FeatureFlag,
  featureFlagState,
} from "./feature-flags"

export type RuntimeModuleGate = {
  area: "backend" | "admin" | "vendor" | "storefront"
  flag: Phase0FeatureFlag
}

export const RUNTIME_MODULE_GATES: Record<string, RuntimeModuleGate> = {
  pos: { area: "backend", flag: "POS_V1" },
  weight_pricing: { area: "backend", flag: "WEIGHT_PRICING_V1" },
  pick_pack: { area: "backend", flag: "PICK_PACK_V1" },
  invoicing: { area: "backend", flag: "INVOICING_V1" },
  channel_sync: { area: "backend", flag: "CHANNEL_SYNC_V1" },
}

export function getRuntimeModuleGateSnapshot() {
  return Object.fromEntries(
    Object.entries(RUNTIME_MODULE_GATES).map(([module, gate]) => [
      module,
      {
        ...gate,
        env: PHASE0_FEATURE_FLAGS[gate.flag],
        enabled: featureFlagState.isEnabled(gate.flag),
      },
    ])
  )
}

export function requireFeatureFlagMiddleware(flag: Phase0FeatureFlag) {
  return async function requireFeatureFlag(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) {
    if (!featureFlagState.isEnabled(flag)) {
      return res.status(404).json({
        type: "feature_disabled",
        message: `Feature flag ${PHASE0_FEATURE_FLAGS[flag]} is disabled`,
      })
    }

    return next()
  }
}

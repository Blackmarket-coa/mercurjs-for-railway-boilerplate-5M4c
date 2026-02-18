const enabled = (value: string | undefined, fallback = false) => {
  if (value === undefined) {
    return fallback
  }

  return value === "true"
}

export const isUnifiedListingEnabled = () =>
  process.env.NEXT_PUBLIC_STOREFRONT_UNIFIED_LISTING !== "false"

export const phase1ModuleFlags = {
  pos: enabled(process.env.NEXT_PUBLIC_FF_POS_V1),
  weightPricing: enabled(process.env.NEXT_PUBLIC_FF_WEIGHT_PRICING_V1),
  pickPack: enabled(process.env.NEXT_PUBLIC_FF_PICK_PACK_V1),
  invoicing: enabled(process.env.NEXT_PUBLIC_FF_INVOICING_V1),
  channelSync: enabled(process.env.NEXT_PUBLIC_FF_CHANNEL_SYNC_V1),
}

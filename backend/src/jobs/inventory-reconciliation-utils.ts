export type InventoryShape = {
  id: string;
  stocked_quantity?: number | string | null;
  reserved_quantity?: number | string | null;
};

export type LotShape = {
  id: string;
  quantity_available?: number | string | null;
  quantity_reserved?: number | string | null;
};

export type WooConnectionShape = {
  id: string;
  last_synced_at?: string | Date | null;
};

export const getInventoryDriftItems = (
  items: InventoryShape[],
): InventoryShape[] => {
  return items.filter((item) => {
    const stocked = Number(item.stocked_quantity || 0);
    const reserved = Number(item.reserved_quantity || 0);
    return reserved > stocked;
  });
};

export const getLotAnomalies = (lots: LotShape[]): LotShape[] => {
  return lots.filter((lot) => {
    const available = Number(lot.quantity_available || 0);
    const reserved = Number(lot.quantity_reserved || 0);

    return available < 0 || reserved < 0;
  });
};

export const getStaleWooConnections = (
  connections: WooConnectionShape[],
  now: number,
  staleThresholdMs: number,
): WooConnectionShape[] => {
  return connections.filter((connection) => {
    if (!connection.last_synced_at) {
      return true;
    }

    const syncedAt = new Date(connection.last_synced_at).getTime();

    return Number.isNaN(syncedAt) || now - syncedAt > staleThresholdMs;
  });
};

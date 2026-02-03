import { HttpTypes } from "@medusajs/types"
import { useQueryParams } from "../../use-query-params"

type UseShippingOptionTableQueryProps = {
  regionId: string
  isReturn?: boolean
  pageSize?: number
  prefix?: string
}

export const useShippingOptionTableQuery = ({
  regionId: _regionId,
  pageSize = 10,
  prefix,
}: UseShippingOptionTableQueryProps) => {
  const queryObject = useQueryParams(
    [
      "offset",
      "q",
      "order",
      "admin_only",
      "is_return",
      "created_at",
      "updated_at",
    ],
    prefix
  )

  const { offset, order, q, admin_only, is_return, created_at, updated_at } =
    queryObject

  const searchParams: HttpTypes.AdminShippingOptionListParams = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    region_id: _regionId || undefined,
    is_return: is_return ? is_return === "true" : undefined,
    admin_only: admin_only ? admin_only === "true" : undefined,
    q,
    order,
    created_at: created_at ? JSON.parse(created_at) : undefined,
    updated_at: updated_at ? JSON.parse(updated_at) : undefined,
  }

  return {
    searchParams,
    raw: queryObject,
  }
}

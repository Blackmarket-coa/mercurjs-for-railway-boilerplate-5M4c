"use client"

import { Button } from "@/components/atoms"
import { BinIcon } from "@/icons"
import { removeShippingMethod } from "@/lib/data/cart"
import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

export const CartShippingMethodRow = ({
  method,
  currency_code,
}: {
  method: HttpTypes.StoreCartShippingMethod
  currency_code: string
}) => {
  const handleRemoveShippingMethod = async () => {
    await removeShippingMethod(method.id)
  }

  return (
    <div className="mb-4 border rounded-md p-4 flex items-center justify-between">
      <div>
        <Text className="txt-medium-plus text-ui-fg-base mb-1">Method</Text>
        <Text className="txt-medium text-ui-fg-subtle">
          {method?.name}{" "}
          {convertToLocale({
            amount: method?.amount!,
            currency_code: currency_code,
          })}
        </Text>
      </div>

      <Button
        variant="tonal"
        size="small"
        className="p-2"
        onClick={handleRemoveShippingMethod}
      >
        <BinIcon size={16} />
      </Button>
    </div>
  )
}

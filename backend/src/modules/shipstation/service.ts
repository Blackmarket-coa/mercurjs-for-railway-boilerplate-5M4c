import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"

export type ShipStationOptions = {
  api_key: string
}

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  static identifier = "shipstation"
  protected options_: ShipStationOptions

  constructor({}, options: ShipStationOptions) {
    super()

    this.options_ = options
  }

  // imports...
import { ShipStationClient } from "./client"

// ...

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  // properties...
  protected client: ShipStationClient

  constructor({}, options: ShipStationOptions) {
    // ...
    this.client = new ShipStationClient(options)
  }// other imports...
import { 
  FulfillmentOption,
} from "@medusajs/framework/types"

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  // ...
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const { carriers } = await this.client.getCarriers() 
    const fulfillmentOptions: FulfillmentOption[] = []

    carriers
      .filter((carrier) => !carrier.disabled_by_billing_plan)
      .forEach((carrier) => {
        carrier.services.forEach((service) => {
          fulfillmentOptions.push({
            id: `${carrier.carrier_id}__${service.service_code}`,
            name: service.name,
            carrier_id: carrier.carrier_id,
            carrier_service_code: service.service_code,
          })
        })
      })

    return fulfillmentOptions
  }
}
}// other imports...
import {
  // ...
  CreateShippingOptionDTO,
} from "@medusajs/framework/types"

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  // ...
  async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }
}
}
// other imports...
import {
  // ...
  MedusaError,
} from "@medusajs/framework/utils"
import { 
  // ...
  CalculateShippingOptionPriceDTO,
} from "@medusajs/framework/types"
import {
  GetShippingRatesResponse,
  ShipStationAddress,
} from "./types"

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  // ...
  private async createShipment({
    carrier_id,
    carrier_service_code,
    from_address,
    to_address,
    items,
    currency_code,
  }: {
    carrier_id: string
    carrier_service_code: string
    from_address?: {
      name?: string
      address?: Omit<
        StockLocationAddressDTO, "created_at" | "updated_at" | "deleted_at"
      >
    },
    to_address?: Omit<
      CartAddressDTO, "created_at" | "updated_at" | "deleted_at" | "id"
    >,
    items: CartLineItemDTO[] | OrderLineItemDTO[],
    currency_code: string
  }): Promise<GetShippingRatesResponse> {
    if (!from_address?.address) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "from_location.address is required to calculate shipping rate"
      )
    }
    const ship_from: ShipStationAddress = {
      name: from_address?.name || "",
      phone: from_address?.address?.phone || "",
      address_line1: from_address?.address?.address_1 || "",
      city_locality: from_address?.address?.city || "",
      state_province: from_address?.address?.province || "",
      postal_code: from_address?.address?.postal_code || "",
      country_code: from_address?.address?.country_code || "",
      address_residential_indicator: "unknown",
    }
    if (!to_address) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "shipping_address is required to calculate shipping rate"
      )
    }
    
    const ship_to: ShipStationAddress = {
      name: `${to_address.first_name} ${to_address.last_name}`,
      phone: to_address.phone || "",
      address_line1: to_address.address_1 || "",
      city_locality: to_address.city || "",
      state_province: to_address.province || "",
      postal_code: to_address.postal_code || "",
      country_code: to_address.country_code || "",
      address_residential_indicator: "unknown",
    }

    // Sum the package's weight
// You can instead create different packages for each item
const packageWeight = items.reduce((sum, item) => {
  // @ts-ignore
  return sum + (item.variant.weight || 0)
}, 0)

return await this.client.getShippingRates({
  shipment: {
    carrier_id: carrier_id,
    service_code: carrier_service_code,
    ship_to,
    ship_from,
    validate_address: "no_validation",
    items: items?.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      sku: item.variant_sku || "",
    })),
    packages: [{
      weight: {
        value: packageWeight,
        unit: "kilogram",
      },
    }],
    customs: {
      contents: "merchandise",
      non_delivery: "return_to_sender",
    },
  },
  rate_options: {
    carrier_ids: [carrier_id],
    service_codes: [carrier_service_code],
    preferred_currency: currency_code as string,
  },
})
  }// other imports...
import { 
  // ...
  CalculatedShippingOptionPrice,
} from "@medusajs/framework/types"

class ShipStationProviderService extends AbstractFulfillmentProviderService {
  // ...
  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"], 
    data: CalculateShippingOptionPriceDTO["data"], 
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const { shipment_id } = data as {
      shipment_id?: string
    } || {}
    const { carrier_id, carrier_service_code } = optionData as {
      carrier_id: string
      carrier_service_code: string
    }
    let rate: Rate | undefined

    if (!shipment_id) {
      const shipment = await this.createShipment({
        carrier_id,
        carrier_service_code,
        from_address: {
          name: context.from_location?.name,
          address: context.from_location?.address,
        },
        to_address: context.shipping_address,
        items: context.items || [],
        currency_code: context.currency_code as string,
      })
      rate = shipment.rate_response.rates[0]
    } else {
      const rateResponse = await this.client.getShipmentRates(shipment_id)
      rate = rateResponse[0].rates[0]
    }

    const calculatedPrice = !rate ? 0 : rate.shipping_amount.amount + rate.insurance_amount.amount + 
      rate.confirmation_amount.amount + rate.other_amount.amount + 
      (rate.tax_amount?.amount || 0)

    return {
      calculated_amount: calculatedPrice,
      is_calculated_price_tax_inclusive: !!rate?.tax_amount,
    }
  }
}
}

export default ShipStationProviderService

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

    // TODO create shipment
  }
}

export default ShipStationProviderService

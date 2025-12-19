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

export default ShipStationProviderService

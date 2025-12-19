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
  }
}
}

export default ShipStationProviderService

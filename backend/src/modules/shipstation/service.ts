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

  // TODO add methods
}

export default ShipStationProviderService

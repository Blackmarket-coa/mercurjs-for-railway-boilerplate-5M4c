import { ShipStationOptions } from "./service"
import { MedusaError } from "@medusajs/framework/utils"

export class ShipStationClient {
  options: ShipStationOptions

  constructor(options) {
    this.options = options
  }

  private async sendRequest(url: string, data?: RequestInit): Promise<any> {
    return fetch(`https://api.shipstation.com/v2${url}`, {
      ...data,
      headers: {
        ...data?.headers,
        "api-key": this.options.api_key,
        "Content-Type": "application/json",
      },
    }).then((resp) => {
      const contentType = resp.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        return resp.text()
      }

      return resp.json()
    })
    .then((resp) => {
      if (typeof resp !== "string" && resp.errors?.length) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `An error occurred while sending a request to ShipStation: ${
            resp.errors.map((error) => error.message)
          }`
        )
      }

      return resp
    })
  }
  // other imports...
import { 
  CarriersResponse,
} from "./types"

export class ShipStationClient {
  // ...
  async getCarriers(): Promise<CarriersResponse> {
    return await this.sendRequest("/carriers") 
  }
}
}

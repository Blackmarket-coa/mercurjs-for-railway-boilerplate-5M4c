import { ModuleProviderExports } from "@medusajs/framework/types"
import PrintfulFulfillmentService from "./service"

const services = [PrintfulFulfillmentService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport

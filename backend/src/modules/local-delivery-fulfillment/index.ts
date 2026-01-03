import { ModuleProviderExports } from "@medusajs/framework/types"
import LocalDeliveryFulfillmentService from "./service"

const services = [LocalDeliveryFulfillmentService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport

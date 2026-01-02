import { ModuleProviderExports } from "@medusajs/framework/types"
import InternalDeliveryFulfillmentService from "./service"

const services = [InternalDeliveryFulfillmentService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport

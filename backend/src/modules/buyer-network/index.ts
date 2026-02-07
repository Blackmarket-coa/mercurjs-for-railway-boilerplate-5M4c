import { Module } from "@medusajs/framework/utils"
import BuyerNetworkModuleService from "./service"

export const BUYER_NETWORK_MODULE = "buyerNetworkModuleService"

export default Module(BUYER_NETWORK_MODULE, {
  service: BuyerNetworkModuleService,
})

export * from "./models"

import { Module } from "@medusajs/framework/utils"
import HarvestBatchesService from "./service"

export const HARVEST_BATCHES_MODULE = "harvest_batches"

export default Module(HARVEST_BATCHES_MODULE, {
  service: HarvestBatchesService,
})

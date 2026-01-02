import { Module } from "@medusajs/framework/utils"
import ImpactMetricsService from "./service"

export const IMPACT_METRICS_MODULE = "impactMetrics"

export default Module(IMPACT_METRICS_MODULE, {
  service: ImpactMetricsService,
})

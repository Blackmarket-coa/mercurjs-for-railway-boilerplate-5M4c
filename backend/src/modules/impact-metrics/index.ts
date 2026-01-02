import { Module } from "@medusajs/framework/utils"
import ImpactMetricsService from "./service"

export const IMPACT_METRICS_MODULE = "impact_metrics"

export default Module(IMPACT_METRICS_MODULE, {
  service: ImpactMetricsService,
})

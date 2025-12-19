export type Carrier = {
  carrier_id: string
  disabled_by_billing_plan: boolean
  friendly_name: string
  services: {
    service_code: string
    name: string
  }[]
  packages: {
    package_code: string
  }[]
  [k: string]: unknown
}

export type CarriersResponse = {
  carriers: Carrier[]
}

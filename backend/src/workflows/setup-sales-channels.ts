import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const setupChannelsStep = createStep(
  "setup-channels",
  async ({}, { container }) => {
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

    const channels = await salesChannelService.createSalesChannels([
      {
        name: "Local Delivery",
        description: "Perishable goods - cottage food, ghost kitchens, restaurants, mutual aid",
        metadata: {
          type: "local",
          requires_delivery_zone: true,
          perishable: true,
        },
      },
      {
        name: "B2B Wholesale",
        description: "Farm-to-restaurant, bulk agricultural products",
        metadata: {
          type: "b2b",
          requires_business_verification: true,
          minimum_order: true,
        },
      },
      {
        name: "D2C Mail Order",
        description: "Non-perishable goods shipped nationwide",
        metadata: {
          type: "d2c",
          shipping_required: true,
          perishable: false,
        },
      },
    ])

    return new StepResponse({ channels })
  }
)

export const setupSalesChannelsWorkflow = createWorkflow(
  "setup-sales-channels",
  () => {
    const { channels } = setupChannelsStep()
    return new WorkflowResponse({ channels })
  }
)
```

**2. Vendor Types (extend MercurJS sellers):**

| Vendor Type | Sales Channels | Features Needed |
|-------------|----------------|-----------------|
| Cottage Food Producer | Local Delivery | P2P, zone restrictions, home kitchen compliance |
| Ghost Kitchen Collective | Local Delivery | Multi-vendor kitchen, shared prep scheduling |
| Small Restaurant | Local Delivery, B2B | Menu management, pickup/delivery toggle |
| Food Bank | Local Delivery | Donation tracking, need-based distribution |
| Mutual Aid Network | Local Delivery | Gift economy, trade/barter integration |
| Agricultural Producer | B2B, D2C Mail | Bulk pricing tiers, seasonal availability |

**3. Key Modules to Build:**
```
src/modules/
├── delivery-zones/        # Geofenced delivery areas per vendor
├── vendor-types/          # Cottage, ghost kitchen, farm, etc.
├── b2b-pricing/           # Wholesale tiers, minimum orders
├── mutual-aid/            # Gift/trade/barter system
└── compliance/            # Cottage food laws by state

# Food Distribution Module

A comprehensive module for managing food distribution operations in the solidarity economy, supporting restaurants, cottage food producers, ghost kitchens, food banks, mutual aid organizations, and more.

## Overview

This module extends beyond traditional restaurant delivery to support the full spectrum of food distribution:

### Producer Types
- **RESTAURANT** - Full-service restaurants
- **GHOST_KITCHEN** - Delivery-only commercial kitchens
- **COTTAGE_FOOD** - Home-based producers under cottage food laws
- **HOME_BAKER** - Home-based bakers and confectioners
- **FOOD_BANK** - Food banks and pantries
- **MUTUAL_AID** - Mutual aid organizations
- **COOPERATIVE** - Food cooperatives
- **FARM** - Direct farm sales
- **CSA** - Community Supported Agriculture
- **FOOD_HUB** - Food aggregation hubs
- **COMMERCIAL_KITCHEN** - Shared commercial kitchens
- **CATERER** - Catering services
- **FOOD_TRUCK** - Mobile food vendors
- **POP_UP** - Pop-up food operations

### Transaction Types
- **SALE** - Standard commercial transactions
- **PREPAID** - Pre-paid orders (subscriptions, etc.)
- **DONATION** - Free food donations
- **TRADE** - Barter/exchange transactions
- **GIFT** - Gifted food
- **COMMUNITY_SHARE** - Community distribution programs
- **RESCUE** - Food waste reduction/rescue
- **GLEANING** - Harvesting excess crops

### Courier Types
- **INDEPENDENT** - Gig economy drivers
- **EMPLOYEE** - Direct employees
- **VOLUNTEER** - Volunteer couriers
- **COMMUNITY** - Community members
- **COOP_MEMBER** - Cooperative member drivers

## Module Structure

```
food-distribution/
├── models/
│   ├── food-producer.ts    # Producer and admin models
│   ├── courier.ts          # Courier and shift models
│   ├── food-order.ts       # Order and item models
│   ├── delivery.ts         # Delivery tracking models
│   └── index.ts
├── service.ts              # Core business logic
└── index.ts                # Module definition
```

## API Endpoints

### Food Producers

```
GET    /store/food-producers              # List producers
POST   /store/food-producers              # Create producer
GET    /store/food-producers/:id          # Get producer
PUT    /store/food-producers/:id          # Update producer
DELETE /store/food-producers/:id          # Deactivate producer
GET    /store/food-producers/:id/orders   # List producer's orders
POST   /store/food-producers/:id/orders   # Create order for producer
```

### Couriers

```
GET    /store/couriers                    # List couriers
POST   /store/couriers                    # Register courier
GET    /store/couriers/:id                # Get courier
PUT    /store/couriers/:id                # Update courier
POST   /store/couriers/:id/claim          # Claim a delivery
GET    /store/couriers/:id/shifts         # List shifts
POST   /store/couriers/:id/shifts         # Create shift
```

### Deliveries

```
GET    /store/food-deliveries             # List deliveries
POST   /store/food-deliveries             # Create delivery
GET    /store/food-deliveries/:id         # Get delivery
PUT    /store/food-deliveries/:id         # Update delivery
GET    /store/food-deliveries/:id/track   # Get tracking data
POST   /store/food-deliveries/:id/track   # Update location
POST   /store/food-deliveries/:id/proof   # Submit proof of delivery
GET    /store/food-deliveries/:id/subscribe  # SSE subscription
```

### Delivery Zones

```
GET    /store/delivery-zones              # List zones
POST   /store/delivery-zones              # Create zone
GET    /store/delivery-zones/:id          # Get zone
PUT    /store/delivery-zones/:id          # Update zone
POST   /store/delivery-zones/:id/check-coverage  # Check if point in zone
```

### Batch Deliveries

```
GET    /store/delivery-batches            # List batches
POST   /store/delivery-batches            # Create batch
GET    /store/delivery-batches/:id        # Get batch
PUT    /store/delivery-batches/:id        # Update batch
POST   /store/delivery-batches/:id/deliveries  # Add deliveries
```

### Donations

```
GET    /store/food-donations              # List donations
POST   /store/food-donations              # Create donation
```

### Trades

```
GET    /store/food-trades                 # List trades
POST   /store/food-trades                 # Create trade offer
GET    /store/food-trades/:id             # Get trade
POST   /store/food-trades/:id/respond     # Respond to trade
```

## Workflows

### Create Food Delivery Workflow
Creates a new delivery for an order.

### Handle Food Delivery Workflow
Long-running workflow managing complete delivery lifecycle:
1. Set transaction ID for tracking
2. Notify producer of new order
3. Wait for courier to claim delivery
4. Wait for producer to start preparation
5. Wait for order to be ready
6. Wait for courier to pick up order
7. Wait for delivery completion
8. Complete and update stats

### Supporting Workflows
- **Claim Delivery** - Courier claims a delivery
- **Order Ready** - Producer marks order ready
- **Confirm Pickup** - Courier confirms pickup
- **Confirm Delivery** - Courier confirms delivery

## Features

### Real-time Tracking
- GPS breadcrumb tracking
- SSE subscriptions for live updates
- Location-based ETA calculation

### Proof of Delivery
- Photo proof
- Digital signature
- PIN code verification
- Recipient confirmation

### Temperature Control
- Hot/cold item flags
- Temperature logging

### Batch Deliveries
- Group multiple deliveries for efficiency
- Optimized route planning
- Community food distribution runs

### Zone-based Delivery
- GeoJSON polygon boundaries
- Dynamic fee calculation
- Service hour management

### Hawala Integration
- Connects to hawala module for alternative payments
- Producer and courier earnings tracking

## Configuration

Add to `medusa-config.ts`:

```typescript
modules: [
  {
    resolve: "./src/modules/food-distribution",
    options: {},
  },
]
```

## Usage Examples

### Creating a Donation

```typescript
const response = await fetch('/store/food-donations', {
  method: 'POST',
  body: JSON.stringify({
    producer_id: 'prod_123',
    transaction_type: 'DONATION',
    recipient_organization: 'Local Food Bank',
    fulfillment_type: 'DELIVERY',
    items: [
      { name: 'Fresh Bread', quantity: 10 },
      { name: 'Canned Soup', quantity: 24 }
    ]
  })
})
```

### Creating a Trade Offer

```typescript
const response = await fetch('/store/food-trades', {
  method: 'POST',
  body: JSON.stringify({
    producer_id: 'prod_456',
    customer_name: 'Local Farm',
    trade_offer_description: 'Fresh eggs and seasonal vegetables',
    trade_offer_items: [
      { name: 'Farm Fresh Eggs', quantity: 3, estimated_value: 15 },
      { name: 'Seasonal Squash', quantity: 5, estimated_value: 10 }
    ],
    items: [
      { name: 'Homemade Bread', quantity: 2, estimated_value: 12 }
    ]
  })
})
```

### Subscribing to Delivery Updates

```typescript
const eventSource = new EventSource(`/store/food-deliveries/${deliveryId}/subscribe`)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch (data.type) {
    case 'status_change':
      console.log(`Status: ${data.new_status}`)
      break
    case 'location_update':
      updateMap(data.location.latitude, data.location.longitude)
      break
  }
}
```

## License

MIT

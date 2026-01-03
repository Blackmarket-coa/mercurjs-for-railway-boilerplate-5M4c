# Business Logic & Marketplace-Specific Audit Report

**FreeBlackMarket.com - Multi-Vendor Marketplace**  
**Audit Date:** Current Session  
**Platform:** MercurJS/Medusa

---

## Executive Summary

This audit examines business logic, marketplace-specific features, and critical workflows across the FreeBlackMarket.com codebase. The platform is a food-focused, solidarity economy marketplace supporting multiple vendor types (farms, restaurants, food banks, mutual aid organizations).

### Critical Finding Count

| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 2 |
| 🟡 Medium | 3 |
| 🔵 Low | 2 |

---

## 1. Commission & Payout Logic

### 1.1 🔴 CRITICAL: Hardcoded Platform Fee Inconsistency

**Location:** `backend/src/subscribers/hawala-order-payment.ts` (Line 73)

**Issue:**
```typescript
const platformFeePercentage = 0.05 // 5% platform fee
```

**Problem:**
- The Hawala subscriber uses a **hardcoded 5% platform fee**
- The `payout-breakdown` module is configured for **3% platform fee** (see `PayoutBreakdownService.getDefaultConfig()`)
- This overcharges sellers by 2% on every order processed through the Hawala ledger

**Business Impact:**
- Sellers receive less than expected
- Marketing materials and sell page likely advertise 3%
- Financial inconsistency in ledger vs breakdown reports

**Recommended Fix:**
```typescript
// Import payout-breakdown service
import { PAYOUT_BREAKDOWN_MODULE } from "../modules/payout-breakdown"
import PayoutBreakdownService from "../modules/payout-breakdown/service"

// In subscriber:
const payoutService = container.resolve<PayoutBreakdownService>(PAYOUT_BREAKDOWN_MODULE)
const platformFeePercent = await payoutService.getEffectivePlatformFee(sellerId)
const platformFeeAmount = totalAmount * (platformFeePercent / 100)
```

### 1.2 Payout System Architecture (✅ Well-Designed)

**Location:** `backend/src/modules/payout-breakdown/`

**Strengths:**
- Supports per-seller custom fee overrides with expiration dates
- Comprehensive fee breakdown (producer price, platform fee, payment processing, delivery, community fund, tax, tip)
- Calculates and stores breakdowns for order history
- Multi-seller order support with proper attribution

**Default Configuration:**
```typescript
platform_fee_percent: 3         // 3% to platform
payment_processing_percent: 2.9 // 2.9% + $0.30 (Stripe fees)
payment_processing_fixed: 30    // $0.30 fixed
community_fund_percent: 0       // Optional community reinvestment
```

---

## 2. Vendor Verification & Trust

### 2.1 ✅ Vendor Verification System (Well-Structured)

**Location:** `backend/src/modules/vendor-verification/`

**Trust Score Calculation:**
| Verification Type | Weight |
|------------------|--------|
| IDENTITY | 20 |
| LOCATION | 15 |
| PRODUCTION | 15 |
| CERTIFICATION | 15 |
| BANK_ACCOUNT | 15 |
| PRACTICES | 10 |
| TAX_INFO | 10 |

**Verification Levels:**
1. `UNVERIFIED` - No verification
2. `SELF_REPORTED` - Vendor claims
3. `VERIFIED` - Admin verified
4. `AUDITED` - In-person audit
5. `CERTIFIED` - Full certification

**Badge System (14 Types):**
- VERIFIED_PRODUCER, LOCAL_PRODUCER, ORGANIC_CERTIFIED
- BLACK_OWNED, WOMAN_OWNED, VETERAN_OWNED
- COMMUNITY_PARTNER, FAIR_TRADE, SUSTAINABLE_PRACTICES
- TOP_RATED, ESTABLISHED_SELLER, QUICK_RESPONDER
- ECO_FRIENDLY, TRUSTED_SHIPPER

### 2.2 🟡 MEDIUM: Missing Badge Requirement Validation

**Location:** `backend/src/modules/vendor-verification/service.ts`

**Issue:** Badge requirements exist in `BADGE_CONFIG` but validation logic doesn't fully utilize them for automated badge assignment.

**Recommendation:** Implement automated badge evaluation based on requirements:
- `months_active` threshold checking
- `referrals` count validation
- `percentile` ranking calculation

---

## 3. Order Fulfillment & Delivery

### 3.1 ✅ Food Distribution Workflow (Excellent)

**Location:** `backend/src/modules/food-distribution/` and `backend/src/workflows/food-distribution/`

**Delivery Lifecycle (Long-Running Workflow):**
1. Set transaction ID for tracking
2. Notify producer of new order
3. Wait for courier to claim delivery
4. Wait for producer to start preparation
5. Wait for order to be ready
6. Wait for courier to pick up order
7. Wait for delivery completion
8. Complete and update stats

**Delivery Statuses:**
- `PENDING` → `ASSIGNED` → `COURIER_EN_ROUTE_PICKUP`
- `COURIER_ARRIVED_PICKUP` → `WAITING_FOR_ORDER` → `ORDER_PICKED_UP`
- `EN_ROUTE_DELIVERY` → `ARRIVED_AT_DESTINATION` → `DELIVERED`

**Strengths:**
- 4-hour workflow retention for handling delays
- Comprehensive status tracking
- Async steps with API resume capability
- Courier management (employees, volunteers, contractors)

### 3.2 🟡 MEDIUM: Duplicate Delivery Modules

**Issue:** There are multiple delivery implementations:
- `backend/src/modules/food-distribution/` (main)
- `backend/src/workflows/delivery/` (restaurant-marketplace port)
- `backend/restaurant-marketplace/` (legacy?)

**Recommendation:** Consolidate to single food-distribution module, remove duplicates.

---

## 4. Payment Splitting & Hawala Ledger

### 4.1 ✅ Hawala Ledger System (Comprehensive)

**Location:** `backend/src/modules/hawala-ledger/`

**Account Types:**
- `USER_WALLET` - Customer balance
- `SELLER_EARNINGS` - Vendor earnings
- `PRODUCER_POOL` - Producer funds
- `PLATFORM_FEE` - Platform revenue
- `SETTLEMENT` - Settlement processing
- `RESERVE` - Reserve funds
- `ESCROW` - Held funds

**Features:**
- Double-entry accounting (always balanced)
- Investment pools for community investment
- Vendor advances with repayment tracking
- Credit lines for established vendors
- Chargeback protection
- ACH bank transfer integration
- Audit logging

### 4.2 🟠 HIGH: Missing Ledger-Payout Integration

**Issue:** The `hawala-order-payment.ts` subscriber doesn't use the `payout-breakdown` service to calculate splits. The breakdown is calculated but not used for actual ledger entries.

**Current Flow:**
1. Order placed → `order.placed` event
2. Hawala subscriber calculates hardcoded 5% fee
3. Creates ledger entries with wrong amounts

**Recommended Flow:**
1. Order placed → `order.placed` event
2. Call `payoutBreakdownService.calculateBreakdown()`
3. Store breakdown for transparency
4. Use breakdown totals for ledger entries

---

## 5. Subscription & Recurring Orders

### 5.1 ✅ Subscription Module (Well-Architected)

**Location:** `backend/src/modules/subscription/` and `backend/src/workflows/subscription/`

**Supported Subscription Types:**
- CSA Shares (weekly/monthly produce boxes)
- Meal Plans (restaurant subscriptions)
- Garden Memberships
- Cooperative Memberships

**Intervals:**
- `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`

**Status Lifecycle:**
- `ACTIVE` → `PAUSED` (customer request)
- `ACTIVE` → `CANCELED` (customer cancels)
- `ACTIVE` → `EXPIRED` (reached end date)
- `ACTIVE` → `FAILED` (payment failure)

**Jobs:**
- `process-subscription-renewals` - Hourly renewal check
- `order-cycle-status-update` - Every 5 minutes

### 5.2 🟡 MEDIUM: Incomplete Renewal Payment Integration

**Location:** `backend/src/jobs/process-subscription-renewals.ts`

**Issue:** The job notes "In production, you would..." for:
- Creating orders from cart template
- Capturing payment from saved method
- Sending confirmation emails

**Current State:** Just updates subscription dates, doesn't actually create renewal orders.

**Recommendation:** Implement full `renewSubscriptionWorkflow` integration with payment capture.

---

## 6. Vendor Rules & Order Validation

### 6.1 ✅ Vendor Rules System (Good)

**Location:** `backend/src/modules/vendor-rules/`

**Validation Checks:**
- `accepting_orders` flag
- Minimum order value
- Minimum item count
- Allowed fulfillment methods (delivery/pickup)
- Max delivery distance
- Daily/weekly order limits (noted but not fully implemented)
- Customer tier exceptions

**Fulfillment Windows:**
- Day-of-week scheduling
- Capacity limits
- Time windows
- Location-specific options

### 6.2 🔵 LOW: Customer Tier Benefits Incomplete

**Issue:** Tier benefits like `priority_checkout`, `free_delivery_threshold`, `discount_percentage` are defined but not enforced in checkout flow.

---

## 7. Request/Approval System

### 7.1 ✅ Multi-Type Request System (Complete)

**Request Types Supported:**
- `seller` - Seller account creation
- `product` - New product listing
- `product_update` - Product modifications
- `product_category` - New categories
- `product_collection` - New collections
- `product_tag` - New tags
- `product_type` - New product types

**Workflow:**
1. Vendor submits request
2. Admin reviews in admin panel
3. Accept/Reject with optional note
4. Notifications sent to vendor

### 7.2 🔵 LOW: No Auto-Approval Option

**Recommendation:** Add option for trusted/verified sellers to auto-approve certain request types.

---

## 8. Multi-Vendor Cart & Inventory

### 8.1 🟠 HIGH: Multi-Vendor Cart Split Not Found

**Issue:** No explicit multi-vendor cart splitting logic found. When customers order from multiple vendors, the system should:
- Split order into per-vendor sub-orders
- Calculate separate shipping per vendor
- Handle partial fulfillments
- Track inventory per seller

**Current State:** Appears to rely on Medusa/MercurJS defaults, but marketplace-specific splitting may be incomplete.

**Recommendation:** Implement explicit multi-vendor cart handling:
```typescript
// Pseudocode for cart splitting
async function splitCartByVendor(cart) {
  const vendorGroups = groupBy(cart.items, 'seller_id')
  return Object.entries(vendorGroups).map(([sellerId, items]) => ({
    sellerId,
    items,
    subtotal: sum(items.map(i => i.unit_price * i.quantity)),
    shipping: calculateVendorShipping(sellerId, items)
  }))
}
```

### 8.2 Inventory Management

**Observation:** Inventory is handled per vendor type:
- Farm vendors: `hasInventory: true`
- Restaurant vendors: `hasInventory: false` (made-to-order)
- Mutual Aid: `hasInventory: true` (resource tracking)

**Harvest Batches:**
`backend/src/modules/harvest-batches/` handles batch reservation for farm products with cart checkout reservations.

---

## Summary of Required Fixes

### Immediate (Before Launch)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | 🔴 Hardcoded 5% fee | `hawala-order-payment.ts` | Use `payoutBreakdownService.getEffectivePlatformFee()` |
| 2 | 🟠 Ledger-payout disconnect | `hawala-order-payment.ts` | Integrate `calculateBreakdown()` for ledger entries |

### High Priority

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 3 | 🟠 Multi-vendor cart | Cart checkout | Implement vendor split workflow |
| 4 | 🟡 Renewal payments | `process-subscription-renewals.ts` | Complete payment capture integration |
| 5 | 🟡 Module duplication | `delivery/`, `restaurant-marketplace/` | Consolidate to `food-distribution` |

### Nice to Have

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 6 | 🟡 Badge automation | `vendor-verification` | Auto-evaluate badges on events |
| 7 | 🔵 Tier enforcement | Checkout flow | Apply tier discounts/benefits |
| 8 | 🔵 Auto-approval | Request system | Add trusted seller auto-approve |

---

## Code Quality Observations

### Positive Patterns
- Consistent use of MedusaService base class
- Good workflow architecture with async steps
- Comprehensive TypeScript typing
- Audit logging for financial operations
- Double-entry accounting for ledger

### Areas for Improvement
- Some modules have incomplete implementations with "TODO" or "In production, you would..." comments
- Duplicate module implementations that should be consolidated
- Missing integration between related modules (payout-breakdown ↔ hawala-ledger)

---

*This audit report should be reviewed with the development team to prioritize fixes based on launch timeline and business impact.*

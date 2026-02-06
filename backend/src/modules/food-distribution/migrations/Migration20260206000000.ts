import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260206000000 extends Migration {
  async up(): Promise<void> {
    // =============================================
    // 1. food_producer (parent table - no FKs)
    // =============================================
    this.addSql(`
      create table if not exists "food_producer" (
        "id" text not null,
        "seller_id" text null,
        "name" text not null,
        "handle" text not null,
        "producer_type" text check ("producer_type" in (
          'RESTAURANT','GHOST_KITCHEN','FOOD_TRUCK','CATERING','BAKERY',
          'COTTAGE_FOOD','HOME_BAKER','HOME_COOK',
          'FOOD_BANK','MUTUAL_AID','COMMUNITY_KITCHEN','COMMERCIAL_KITCHEN','COOPERATIVE','COLLECTIVE',
          'FARM','URBAN_FARM','COMMUNITY_GARDEN','CSA','FOOD_HUB'
        )) not null default 'RESTAURANT',
        "description" text null,
        "tagline" text null,
        "email" text not null,
        "phone" text null,
        "secondary_phone" text null,
        "address_line_1" text null,
        "address_line_2" text null,
        "city" text null,
        "state" text null,
        "postal_code" text null,
        "country_code" text not null default 'US',
        "latitude" real null,
        "longitude" real null,
        "hide_address" boolean not null default false,
        "service_area_radius_miles" real null,
        "operating_hours" jsonb null,
        "timezone" text not null default 'America/New_York',
        "operating_status" text check ("operating_status" in (
          'ACCEPTING_ORDERS','PAUSED','PREPARING_ONLY','CLOSED','SEASONAL'
        )) not null default 'CLOSED',
        "accepts_orders" boolean not null default true,
        "accepts_trades" boolean not null default false,
        "accepts_donations" boolean not null default false,
        "donation_only" boolean not null default false,
        "offers_delivery" boolean not null default true,
        "offers_pickup" boolean not null default true,
        "delivery_fee" numeric null,
        "raw_delivery_fee" jsonb null,
        "minimum_order" numeric null,
        "raw_minimum_order" jsonb null,
        "free_delivery_threshold" numeric null,
        "raw_free_delivery_threshold" jsonb null,
        "estimated_prep_time_minutes" integer not null default 30,
        "licenses" jsonb null,
        "cottage_food_state" text null,
        "verified" boolean not null default false,
        "verified_at" timestamptz null,
        "verification_notes" text null,
        "logo_url" text null,
        "cover_image_url" text null,
        "gallery" jsonb null,
        "website" text null,
        "social_links" jsonb null,
        "story" text null,
        "mission" text null,
        "accepting_volunteers" boolean not null default false,
        "volunteer_info" text null,
        "cuisine_types" jsonb null,
        "dietary_options" jsonb null,
        "specialties" jsonb null,
        "average_rating" real null,
        "total_reviews" integer not null default 0,
        "total_orders" integer not null default 0,
        "community_vouches" integer not null default 0,
        "years_active" integer null,
        "accepts_cash" boolean not null default true,
        "accepts_card" boolean not null default true,
        "accepts_ebt_snap" boolean not null default false,
        "accepts_mutual_credit" boolean not null default false,
        "hawala_account_id" text null,
        "public_profile" boolean not null default true,
        "featured" boolean not null default false,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_producer_pkey" primary key ("id")
      );
    `)

    this.addSql(`alter table "food_producer" add constraint "food_producer_handle_unique" unique ("handle");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_seller" ON "food_producer" ("seller_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_handle" ON "food_producer" ("handle") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_type" ON "food_producer" ("producer_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_location" ON "food_producer" ("city", "state") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_status" ON "food_producer" ("operating_status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_public" ON "food_producer" ("public_profile") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_featured" ON "food_producer" ("featured") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_donations" ON "food_producer" ("accepts_donations") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_donation_only" ON "food_producer" ("donation_only") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_deleted_at" ON "food_producer" ("deleted_at") WHERE "deleted_at" IS NULL;`)

    // =============================================
    // 2. food_producer_admin (FK → food_producer)
    // =============================================
    this.addSql(`
      create table if not exists "food_producer_admin" (
        "id" text not null,
        "producer_id" text not null,
        "first_name" text not null,
        "last_name" text not null,
        "email" text not null,
        "phone" text null,
        "role" text check ("role" in ('OWNER','MANAGER','STAFF','VOLUNTEER')) not null default 'STAFF',
        "permissions" jsonb null,
        "active" boolean not null default true,
        "avatar_url" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_producer_admin_pkey" primary key ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_admin_producer_id" ON "food_producer_admin" ("producer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_producer_admin_deleted_at" ON "food_producer_admin" ("deleted_at") WHERE "deleted_at" IS NULL;`)
    this.addSql(`alter table if exists "food_producer_admin" add constraint "food_producer_admin_producer_id_foreign" foreign key ("producer_id") references "food_producer" ("id") on update cascade on delete cascade;`)

    // =============================================
    // 3. food_courier (parent table - no FKs)
    // =============================================
    this.addSql(`
      create table if not exists "food_courier" (
        "id" text not null,
        "first_name" text not null,
        "last_name" text not null,
        "display_name" text null,
        "email" text not null,
        "phone" text not null,
        "courier_type" text check ("courier_type" in (
          'INDEPENDENT','EMPLOYEE','VOLUNTEER','COMMUNITY','COOP_MEMBER'
        )) not null default 'INDEPENDENT',
        "affiliated_producer_ids" jsonb null,
        "cooperative_id" text null,
        "status" text check ("status" in (
          'OFFLINE','AVAILABLE','ON_DELIVERY','RETURNING','BREAK'
        )) not null default 'OFFLINE',
        "last_status_update" timestamptz null,
        "current_latitude" real null,
        "current_longitude" real null,
        "location_updated_at" timestamptz null,
        "vehicle_type" text check ("vehicle_type" in (
          'CAR','BIKE','EBIKE','MOTORCYCLE','SCOOTER','WALKING','VAN','TRUCK'
        )) not null default 'CAR',
        "vehicle_description" text null,
        "license_plate" text null,
        "max_orders_simultaneous" integer not null default 3,
        "has_insulated_bag" boolean not null default false,
        "has_hot_bag" boolean not null default false,
        "has_cold_storage" boolean not null default false,
        "max_weight_lbs" real null,
        "service_area_center_lat" real null,
        "service_area_center_lng" real null,
        "service_area_radius_miles" real null,
        "preferred_zones" jsonb null,
        "weekly_schedule" jsonb null,
        "total_deliveries" integer not null default 0,
        "successful_deliveries" integer not null default 0,
        "average_rating" real null,
        "total_ratings" integer not null default 0,
        "on_time_percentage" real null,
        "total_earnings" numeric not null default 0,
        "raw_total_earnings" jsonb not null default '{"value":"0","precision":20}',
        "pending_payout" numeric not null default 0,
        "raw_pending_payout" jsonb not null default '{"value":"0","precision":20}',
        "hawala_account_id" text null,
        "verified" boolean not null default false,
        "background_check_passed" boolean not null default false,
        "background_check_date" timestamptz null,
        "drivers_license_verified" boolean not null default false,
        "insurance_verified" boolean not null default false,
        "documents" jsonb null,
        "avatar_url" text null,
        "emergency_contact_name" text null,
        "emergency_contact_phone" text null,
        "accepts_cash_orders" boolean not null default true,
        "accepts_donation_deliveries" boolean not null default true,
        "preferred_distance_miles" real null,
        "active" boolean not null default true,
        "deactivated_at" timestamptz null,
        "deactivation_reason" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_courier_pkey" primary key ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_email" ON "food_courier" ("email") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_phone" ON "food_courier" ("phone") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_status" ON "food_courier" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_type" ON "food_courier" ("courier_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_courier_active" ON "food_courier" ("active") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_courier_deleted_at" ON "food_courier" ("deleted_at") WHERE "deleted_at" IS NULL;`)

    // =============================================
    // 4. food_courier_shift (FK → food_courier)
    // =============================================
    this.addSql(`
      create table if not exists "food_courier_shift" (
        "id" text not null,
        "courier_id" text not null,
        "scheduled_start" timestamptz not null,
        "scheduled_end" timestamptz not null,
        "actual_start" timestamptz null,
        "actual_end" timestamptz null,
        "status" text check ("status" in (
          'SCHEDULED','ACTIVE','COMPLETED','CANCELLED','NO_SHOW'
        )) not null default 'SCHEDULED',
        "assigned_zone" text null,
        "deliveries_completed" integer not null default 0,
        "earnings_this_shift" numeric not null default 0,
        "raw_earnings_this_shift" jsonb not null default '{"value":"0","precision":20}',
        "notes" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_courier_shift_pkey" primary key ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_courier_shift_courier_id" ON "food_courier_shift" ("courier_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_courier_shift_deleted_at" ON "food_courier_shift" ("deleted_at") WHERE "deleted_at" IS NULL;`)
    this.addSql(`alter table if exists "food_courier_shift" add constraint "food_courier_shift_courier_id_foreign" foreign key ("courier_id") references "food_courier" ("id") on update cascade on delete set null;`)

    // =============================================
    // 5. food_order (parent table - no FKs)
    // =============================================
    this.addSql(`
      create table if not exists "food_order" (
        "id" text not null,
        "order_number" text not null,
        "transaction_type" text check ("transaction_type" in (
          'SALE','PREPAID','DONATION','TRADE','GIFT','COMMUNITY_SHARE','RESCUE','GLEANING'
        )) not null default 'SALE',
        "medusa_order_id" text null,
        "medusa_cart_id" text null,
        "producer_id" text not null,
        "customer_id" text null,
        "recipient_name" text not null,
        "recipient_phone" text null,
        "recipient_email" text null,
        "anonymous_recipient" boolean not null default false,
        "status" text check ("status" in (
          'PENDING','CONFIRMED','DECLINED','CANCELLED','PREPARING','READY',
          'PICKED_UP','OUT_FOR_DELIVERY','DELIVERED','FAILED_DELIVERY','RETURNED','COMPLETED'
        )) not null default 'PENDING',
        "status_history" jsonb null,
        "fulfillment_type" text check ("fulfillment_type" in (
          'PICKUP','DELIVERY','DINE_IN','CURBSIDE','LOCKER','COMMUNITY_POINT'
        )) not null default 'DELIVERY',
        "delivery_address_line_1" text null,
        "delivery_address_line_2" text null,
        "delivery_city" text null,
        "delivery_state" text null,
        "delivery_postal_code" text null,
        "delivery_country_code" text null,
        "delivery_latitude" real null,
        "delivery_longitude" real null,
        "delivery_instructions" text null,
        "pickup_time_requested" timestamptz null,
        "pickup_time_confirmed" timestamptz null,
        "pickup_instructions" text null,
        "items" jsonb not null,
        "subtotal" numeric not null default 0,
        "raw_subtotal" jsonb not null default '{"value":"0","precision":20}',
        "tax" numeric not null default 0,
        "raw_tax" jsonb not null default '{"value":"0","precision":20}',
        "delivery_fee" numeric not null default 0,
        "raw_delivery_fee" jsonb not null default '{"value":"0","precision":20}',
        "tip" numeric not null default 0,
        "raw_tip" jsonb not null default '{"value":"0","precision":20}',
        "discount" numeric not null default 0,
        "raw_discount" jsonb not null default '{"value":"0","precision":20}',
        "total" numeric not null default 0,
        "raw_total" jsonb not null default '{"value":"0","precision":20}',
        "trade_offer_description" text null,
        "trade_offer_value" numeric null,
        "raw_trade_offer_value" jsonb null,
        "trade_accepted" boolean null,
        "is_recurring_donation" boolean not null default false,
        "donation_source" text null,
        "food_rescue_source" text null,
        "payment_status" text check ("payment_status" in (
          'PENDING','PAID','FAILED','REFUNDED','NOT_APPLICABLE'
        )) not null default 'PENDING',
        "payment_method" text null,
        "payment_reference" text null,
        "paid_at" timestamptz null,
        "hawala_transaction_id" text null,
        "ordered_at" timestamptz not null,
        "confirmed_at" timestamptz null,
        "estimated_ready_at" timestamptz null,
        "actual_ready_at" timestamptz null,
        "estimated_delivery_at" timestamptz null,
        "actual_delivery_at" timestamptz null,
        "completed_at" timestamptz null,
        "prep_started_at" timestamptz null,
        "prep_notes" text null,
        "requires_temperature_control" boolean not null default false,
        "contains_allergens" jsonb null,
        "dietary_restrictions" jsonb null,
        "customer_notes" text null,
        "producer_notes" text null,
        "customer_rating" integer null,
        "customer_review" text null,
        "producer_response" text null,
        "has_issue" boolean not null default false,
        "issue_type" text null,
        "issue_description" text null,
        "issue_resolved" boolean not null default false,
        "workflow_transaction_id" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_order_pkey" primary key ("id")
      );
    `)

    this.addSql(`alter table "food_order" add constraint "food_order_order_number_unique" unique ("order_number");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_number" ON "food_order" ("order_number") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_producer" ON "food_order" ("producer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_customer" ON "food_order" ("customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_status" ON "food_order" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_txn_type" ON "food_order" ("transaction_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_medusa" ON "food_order" ("medusa_order_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_date" ON "food_order" ("ordered_at") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_deleted_at" ON "food_order" ("deleted_at") WHERE "deleted_at" IS NULL;`)

    // =============================================
    // 6. food_order_item (FK → food_order)
    // =============================================
    this.addSql(`
      create table if not exists "food_order_item" (
        "id" text not null,
        "order_id" text not null,
        "product_id" text null,
        "variant_id" text null,
        "name" text not null,
        "description" text null,
        "quantity" integer not null default 1,
        "unit" text not null default 'each',
        "unit_price" numeric not null default 0,
        "raw_unit_price" jsonb not null default '{"value":"0","precision":20}',
        "total" numeric not null default 0,
        "raw_total" jsonb not null default '{"value":"0","precision":20}',
        "customizations" jsonb null,
        "notes" text null,
        "dietary_info" jsonb null,
        "allergens" jsonb null,
        "estimated_value" numeric null,
        "raw_estimated_value" jsonb null,
        "status" text check ("status" in ('PENDING','PREPARING','READY','PACKED')) not null default 'PENDING',
        "best_by" timestamptz null,
        "storage_instructions" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_order_item_pkey" primary key ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_item_order_id" ON "food_order_item" ("order_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_order_item_deleted_at" ON "food_order_item" ("deleted_at") WHERE "deleted_at" IS NULL;`)
    this.addSql(`alter table if exists "food_order_item" add constraint "food_order_item_order_id_foreign" foreign key ("order_id") references "food_order" ("id") on update cascade on delete cascade;`)

    // =============================================
    // 7. food_delivery_batch (parent table - no FKs)
    // =============================================
    this.addSql(`
      create table if not exists "food_delivery_batch" (
        "id" text not null,
        "batch_number" text not null,
        "courier_id" text null,
        "status" text check ("status" in (
          'PLANNING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED'
        )) not null default 'PLANNING',
        "started_at" timestamptz null,
        "completed_at" timestamptz null,
        "optimized_route" jsonb null,
        "total_deliveries" integer not null default 0,
        "completed_deliveries" integer not null default 0,
        "total_distance_miles" real null,
        "total_duration_minutes" integer null,
        "is_community_run" boolean not null default false,
        "community_org_id" text null,
        "notes" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_delivery_batch_pkey" primary key ("id")
      );
    `)

    this.addSql(`alter table "food_delivery_batch" add constraint "food_delivery_batch_batch_number_unique" unique ("batch_number");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_batch_deleted_at" ON "food_delivery_batch" ("deleted_at") WHERE "deleted_at" IS NULL;`)

    // =============================================
    // 8. food_delivery_zone (parent table - no FKs)
    // =============================================
    this.addSql(`
      create table if not exists "food_delivery_zone" (
        "id" text not null,
        "name" text not null,
        "code" text not null,
        "boundary" jsonb not null,
        "center_latitude" real not null,
        "center_longitude" real not null,
        "base_delivery_fee" numeric not null default 0,
        "raw_base_delivery_fee" jsonb not null default '{"value":"0","precision":20}',
        "per_mile_fee" numeric not null default 0,
        "raw_per_mile_fee" jsonb not null default '{"value":"0","precision":20}',
        "minimum_order" numeric null,
        "raw_minimum_order" jsonb null,
        "active" boolean not null default true,
        "priority" integer not null default 0,
        "service_hours" jsonb null,
        "avg_delivery_time_minutes" integer null,
        "active_couriers" integer not null default 0,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_delivery_zone_pkey" primary key ("id")
      );
    `)

    this.addSql(`alter table "food_delivery_zone" add constraint "food_delivery_zone_code_unique" unique ("code");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_zone_deleted_at" ON "food_delivery_zone" ("deleted_at") WHERE "deleted_at" IS NULL;`)

    // =============================================
    // 9. food_delivery (parent table - no FKs, uses text IDs)
    // =============================================
    this.addSql(`
      create table if not exists "food_delivery" (
        "id" text not null,
        "delivery_number" text not null,
        "order_id" text not null,
        "producer_id" text not null,
        "courier_id" text null,
        "status" text check ("status" in (
          'PENDING','ASSIGNED',
          'COURIER_EN_ROUTE_PICKUP','COURIER_ARRIVED_PICKUP','WAITING_FOR_ORDER','ORDER_PICKED_UP',
          'EN_ROUTE_DELIVERY','ARRIVED_AT_DESTINATION','ATTEMPTING_DELIVERY',
          'DELIVERED','DELIVERED_TO_NEIGHBOR','DELIVERED_TO_SAFE_PLACE',
          'DELIVERY_FAILED','CUSTOMER_NOT_AVAILABLE','WRONG_ADDRESS','REFUSED','RETURNED_TO_PRODUCER',
          'CANCELLED'
        )) not null default 'PENDING',
        "status_history" jsonb null,
        "priority" text check ("priority" in (
          'STANDARD','EXPRESS','SCHEDULED','ASAP','BATCH','VOLUNTEER'
        )) not null default 'STANDARD',
        "pickup_address" text not null,
        "pickup_latitude" real null,
        "pickup_longitude" real null,
        "pickup_instructions" text null,
        "pickup_contact_name" text null,
        "pickup_contact_phone" text null,
        "delivery_address" text not null,
        "delivery_latitude" real null,
        "delivery_longitude" real null,
        "delivery_instructions" text null,
        "recipient_name" text not null,
        "recipient_phone" text null,
        "contactless_delivery" boolean not null default false,
        "leave_at_door" boolean not null default false,
        "safe_place_description" text null,
        "assigned_at" timestamptz null,
        "estimated_pickup_at" timestamptz null,
        "courier_departed_for_pickup_at" timestamptz null,
        "courier_arrived_at_pickup_at" timestamptz null,
        "picked_up_at" timestamptz null,
        "estimated_delivery_at" timestamptz null,
        "departed_for_delivery_at" timestamptz null,
        "arrived_at_delivery_at" timestamptz null,
        "delivered_at" timestamptz null,
        "estimated_distance_miles" real null,
        "actual_distance_miles" real null,
        "estimated_duration_minutes" integer null,
        "actual_duration_minutes" integer null,
        "route_tracking" jsonb null,
        "last_known_latitude" real null,
        "last_known_longitude" real null,
        "last_location_update" timestamptz null,
        "proof_type" text check ("proof_type" in (
          'SIGNATURE','PHOTO','PIN_CODE','NONE','RECIPIENT_CONFIRMATION'
        )) not null default 'NONE',
        "proof_photo_url" text null,
        "proof_signature_url" text null,
        "proof_pin_code" text null,
        "proof_recipient_name" text null,
        "proof_notes" text null,
        "requires_hot" boolean not null default false,
        "requires_cold" boolean not null default false,
        "temperature_logged" jsonb null,
        "delivery_fee" numeric not null default 0,
        "raw_delivery_fee" jsonb not null default '{"value":"0","precision":20}',
        "courier_tip" numeric not null default 0,
        "raw_courier_tip" jsonb not null default '{"value":"0","precision":20}',
        "courier_earnings" numeric not null default 0,
        "raw_courier_earnings" jsonb not null default '{"value":"0","precision":20}',
        "batch_id" text null,
        "batch_sequence" integer null,
        "has_issue" boolean not null default false,
        "issue_type" text null,
        "issue_description" text null,
        "issue_reported_at" timestamptz null,
        "issue_resolved_at" timestamptz null,
        "customer_rating" integer null,
        "customer_feedback" text null,
        "courier_rating_of_customer" integer null,
        "courier_rating_of_producer" integer null,
        "delivery_attempts" integer not null default 0,
        "max_attempts" integer not null default 3,
        "rescheduled" boolean not null default false,
        "rescheduled_from_id" text null,
        "reschedule_reason" text null,
        "workflow_transaction_id" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_delivery_pkey" primary key ("id")
      );
    `)

    this.addSql(`alter table "food_delivery" add constraint "food_delivery_delivery_number_unique" unique ("delivery_number");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_number" ON "food_delivery" ("delivery_number") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_order" ON "food_delivery" ("order_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_producer" ON "food_delivery" ("producer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_courier" ON "food_delivery" ("courier_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_status" ON "food_delivery" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_batch" ON "food_delivery" ("batch_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_created" ON "food_delivery" ("created_at") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_deleted_at" ON "food_delivery" ("deleted_at") WHERE "deleted_at" IS NULL;`)

    // =============================================
    // 10. food_delivery_event (FK → food_delivery)
    // =============================================
    this.addSql(`
      create table if not exists "food_delivery_event" (
        "id" text not null,
        "delivery_id" text not null,
        "event_type" text not null,
        "occurred_at" timestamptz not null,
        "latitude" real null,
        "longitude" real null,
        "previous_status" text null,
        "new_status" text null,
        "actor_type" text check ("actor_type" in (
          'COURIER','PRODUCER','CUSTOMER','SYSTEM','ADMIN'
        )) not null default 'SYSTEM',
        "actor_id" text null,
        "description" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "food_delivery_event_pkey" primary key ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_event_delivery_id" ON "food_delivery_event" ("delivery_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_food_delivery_event_deleted_at" ON "food_delivery_event" ("deleted_at") WHERE "deleted_at" IS NULL;`)
    this.addSql(`alter table if exists "food_delivery_event" add constraint "food_delivery_event_delivery_id_foreign" foreign key ("delivery_id") references "food_delivery" ("id") on update cascade on delete cascade;`)
  }

  async down(): Promise<void> {
    // Drop child tables first (with FKs)
    this.addSql(`alter table if exists "food_delivery_event" drop constraint if exists "food_delivery_event_delivery_id_foreign";`)
    this.addSql(`alter table if exists "food_order_item" drop constraint if exists "food_order_item_order_id_foreign";`)
    this.addSql(`alter table if exists "food_courier_shift" drop constraint if exists "food_courier_shift_courier_id_foreign";`)
    this.addSql(`alter table if exists "food_producer_admin" drop constraint if exists "food_producer_admin_producer_id_foreign";`)

    this.addSql(`drop table if exists "food_delivery_event" cascade;`)
    this.addSql(`drop table if exists "food_delivery" cascade;`)
    this.addSql(`drop table if exists "food_delivery_zone" cascade;`)
    this.addSql(`drop table if exists "food_delivery_batch" cascade;`)
    this.addSql(`drop table if exists "food_order_item" cascade;`)
    this.addSql(`drop table if exists "food_order" cascade;`)
    this.addSql(`drop table if exists "food_courier_shift" cascade;`)
    this.addSql(`drop table if exists "food_courier" cascade;`)
    this.addSql(`drop table if exists "food_producer_admin" cascade;`)
    this.addSql(`drop table if exists "food_producer" cascade;`)
  }
}

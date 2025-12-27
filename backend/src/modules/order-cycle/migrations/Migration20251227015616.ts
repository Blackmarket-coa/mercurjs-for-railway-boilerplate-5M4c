import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251227015616 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "order_cycle" ("id" text not null, "name" text not null, "description" text null, "opens_at" timestamptz not null, "closes_at" timestamptz not null, "dispatch_at" timestamptz not null, "status" text check ("status" in ('draft', 'upcoming', 'open', 'closed', 'dispatched', 'cancelled')) not null default 'draft', "coordinator_seller_id" text not null, "is_recurring" boolean not null default false, "recurrence_rule" text null, "pickup_instructions" text null, "pickup_location" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_cycle_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_cycle_deleted_at" ON "order_cycle" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_STATUS" ON "order_cycle" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_OPENS_AT" ON "order_cycle" ("opens_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_CLOSES_AT" ON "order_cycle" ("closes_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_COORDINATOR" ON "order_cycle" ("coordinator_seller_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "order_cycle_product" ("id" text not null, "order_cycle_id" text not null, "variant_id" text not null, "seller_id" text not null, "available_quantity" integer null, "sold_quantity" integer not null default 0, "price_override" numeric null, "is_visible" boolean not null default true, "display_order" integer not null default 0, "metadata" jsonb null, "raw_price_override" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_cycle_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_cycle_product_order_cycle_id" ON "order_cycle_product" ("order_cycle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_cycle_product_deleted_at" ON "order_cycle_product" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_ORDER_CYCLE_ID" ON "order_cycle_product" ("order_cycle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_VARIANT_ID" ON "order_cycle_product" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_SELLER_ID" ON "order_cycle_product" ("seller_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_OCP_CYCLE_VARIANT" ON "order_cycle_product" ("order_cycle_id", "variant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "order_cycle_seller" ("id" text not null, "order_cycle_id" text not null, "seller_id" text not null, "role" text check ("role" in ('coordinator', 'producer', 'hub')) not null default 'producer', "commission_rate" real null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_cycle_seller_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_cycle_seller_order_cycle_id" ON "order_cycle_seller" ("order_cycle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_cycle_seller_deleted_at" ON "order_cycle_seller" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCS_ORDER_CYCLE_ID" ON "order_cycle_seller" ("order_cycle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCS_SELLER_ID" ON "order_cycle_seller" ("seller_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_OCS_CYCLE_SELLER" ON "order_cycle_seller" ("order_cycle_id", "seller_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "order_cycle_product" add constraint "order_cycle_product_order_cycle_id_foreign" foreign key ("order_cycle_id") references "order_cycle" ("id") on update cascade;`);

    this.addSql(`alter table if exists "order_cycle_seller" add constraint "order_cycle_seller_order_cycle_id_foreign" foreign key ("order_cycle_id") references "order_cycle" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_cycle_product" drop constraint if exists "order_cycle_product_order_cycle_id_foreign";`);

    this.addSql(`alter table if exists "order_cycle_seller" drop constraint if exists "order_cycle_seller_order_cycle_id_foreign";`);

    this.addSql(`drop table if exists "order_cycle" cascade;`);

    this.addSql(`drop table if exists "order_cycle_product" cascade;`);

    this.addSql(`drop table if exists "order_cycle_seller" cascade;`);
  }

}

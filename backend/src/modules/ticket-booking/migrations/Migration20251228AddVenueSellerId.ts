import { Migration } from "@mikro-orm/migrations"

export class Migration20251228AddVenueSellerId extends Migration {
  async up(): Promise<void> {
    // Add seller_id to venue
    this.addSql('alter table if exists "venue" add column if not exists "seller_id" text not null default \'\';')
    this.addSql('create index if not exists "IDX_venue_seller_id" on "venue" ("seller_id");')
    
    // Add seller_id to ticket_product
    this.addSql('alter table if exists "ticket_product" add column if not exists "seller_id" text not null default \'\';')
    this.addSql('create index if not exists "IDX_ticket_product_seller_id" on "ticket_product" ("seller_id");')
  }

  async down(): Promise<void> {
    this.addSql('drop index if exists "IDX_venue_seller_id";')
    this.addSql('alter table if exists "venue" drop column if exists "seller_id";')
    
    this.addSql('drop index if exists "IDX_ticket_product_seller_id";')
    this.addSql('alter table if exists "ticket_product" drop column if exists "seller_id";')
  }
}

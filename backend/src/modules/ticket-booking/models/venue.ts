import { model } from "@medusajs/framework/utils"
import { VenueRow } from "./venue-row"

export const Venue = model.define("venue", {
  id: model.id().primaryKey(),
  name: model.text(),
  address: model.text().nullable(),
  seller_id: model.text(),
  rows: model.hasMany(() => VenueRow, {
    mappedBy: "venue"
  })
})
.cascades({
  delete: ["rows"]
})

export default Venue

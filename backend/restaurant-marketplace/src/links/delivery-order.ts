import DeliveryModule from "../modules/delivery";
import OrderModule from "@medusajs/medusa/order";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  DeliveryModule.linkable.delivery,
  OrderModule.linkable.order
);

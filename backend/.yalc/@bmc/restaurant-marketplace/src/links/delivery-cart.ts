import DeliveryModule from "../modules/delivery";
import CartModule from "@medusajs/medusa/cart";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
  DeliveryModule.linkable.delivery,
  CartModule.linkable.cart
);

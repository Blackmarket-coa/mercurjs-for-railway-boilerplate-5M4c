import { 
  defineMiddlewares,
} from "@medusajs/framework/http";
import { authenticate } from "@medusajs/medusa";
import { isDeliveryRestaurant } from "../../../utils/is-delivery-restaurant";
import { isDeliveryDriver } from "../../../utils/is-delivery-driver";

export default defineMiddlewares({
  routes: [
    // restaurant routes
    {
      matcher: "/deliveries/:id/accept",
      middlewares: [
        // @ts-ignore - type mismatch between medusa authenticate and framework middleware
        authenticate("restaurant", "bearer"),
        // @ts-ignore
        isDeliveryRestaurant
      ]
    },
    {
      matcher: "/deliveries/:id/prepare",
      middlewares: [
        // @ts-ignore
        authenticate("restaurant", "bearer"),
        // @ts-ignore
        isDeliveryRestaurant
      ]
    },
    {
      matcher: "/deliveries/:id/ready",
      middlewares: [
        // @ts-ignore
        authenticate("restaurant", "bearer"),
        // @ts-ignore
        isDeliveryRestaurant
      ]
    },
    // driver routes
    {
      matcher: "/deliveries/:id/claim",
      middlewares: [
        // @ts-ignore
        authenticate("driver", "bearer"),
      ]
    },
    {
      matcher: "/deliveries/:id/pick-up",
      middlewares: [
        // @ts-ignore
        authenticate("driver", "bearer"),
        // @ts-ignore
        isDeliveryDriver
      ]
    },
    {
      matcher: "/deliveries/:id/complete",
      middlewares: [
        // @ts-ignore
        authenticate("driver", "bearer"),
        // @ts-ignore
        isDeliveryDriver
      ]
    },
  ]
})

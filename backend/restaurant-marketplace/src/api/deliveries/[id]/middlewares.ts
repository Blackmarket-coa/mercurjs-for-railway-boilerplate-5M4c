import { 
  authenticate, 
  defineMiddlewares, 
} from "@medusajs/framework/http";
import { isDeliveryRestaurant } from "../../utils/is-delivery-restaurant";
import { isDeliveryDriver } from "../../utils/is-delivery-driver";

export default defineMiddlewares({
  routes: [
    // restaurant routes
    {
      matcher: "/deliveries/:id/accept",
      middlewares: [
        authenticate("restaurant", "bearer"),
        isDeliveryRestaurant as any
      ]
    },
    {
      matcher: "/deliveries/:id/prepare",
      middlewares: [
        authenticate("restaurant", "bearer"),
        isDeliveryRestaurant as any
      ]
    },
    {
      matcher: "/deliveries/:id/ready",
      middlewares: [
        authenticate("restaurant", "bearer"),
        isDeliveryRestaurant as any
      ]
    },
    // driver routes
    {
      matcher: "/deliveries/:id/claim",
      middlewares: [
        authenticate("driver", "bearer"),
      ]
    },
    {
      matcher: "/deliveries/:id/pick-up",
      middlewares: [
        authenticate("driver", "bearer"),
        isDeliveryDriver as any
      ]
    },
    {
      matcher: "/deliveries/:id/complete",
      middlewares: [
        authenticate("driver", "bearer"),
        isDeliveryDriver as any
      ]
    },
  ]
})

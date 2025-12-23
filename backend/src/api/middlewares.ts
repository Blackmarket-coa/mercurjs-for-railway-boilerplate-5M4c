import { 
  validateAndTransformBody,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createDigitalProductsSchema } from "./validation-schemas"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

// Wrap multer to fix Express v5 type incompatibility
const uploadMiddleware = (
  req: MedusaRequest, 
  res: MedusaResponse, 
  next: MedusaNextFunction
) => {
  return upload.array("files")(req as any, res as any, next)
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/digital-products",
      method: "POST",
      middlewares: [
        validateAndTransformBody(createDigitalProductsSchema),
      ],
    },
    {
      matcher: "/admin/digital-products/upload**",
      method: "POST",
      middlewares: [
        uploadMiddleware,
      ]
    }
  ],
})

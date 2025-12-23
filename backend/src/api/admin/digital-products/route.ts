import { Router } from "express";
import { z } from "zod";
import { validateAndTransformQuery } from "../middlewares";
import { MedusaError } from "medusajs";

const router = Router();

// Example Zod schema for product creation
const createDigitalProductsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
  // add other product fields here
});

type ProductInput = z.infer<typeof createDigitalProductsSchema>;

router.post("/", async (req, res) => {
  try {
    // Validate body using Zod
    const product: ProductInput = createDigitalProductsSchema.parse(req.body);

    // Merge validated product with vendor info
    const newProduct = {
      ...product,
      vendor_id: req.user.id, // assuming you have user in req
    };

    // Example: save to DB (replace with actual Medusa service call)
    const savedProduct = await req.scope.resolve("digitalProductService").create(newProduct);

    res.status(201).json(savedProduct);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    if (err instanceof MedusaError) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

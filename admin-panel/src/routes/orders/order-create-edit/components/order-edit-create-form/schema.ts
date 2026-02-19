import { z } from "zod"

export const OrderEditCreateSchema = z.object({})

export type CreateOrderEditSchemaType = z.infer<typeof OrderEditCreateSchema>

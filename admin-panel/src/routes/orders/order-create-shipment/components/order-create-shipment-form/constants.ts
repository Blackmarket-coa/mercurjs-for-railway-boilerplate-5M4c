import { z } from "zod";

export const CreateShipmentSchema = z.object({
  labels: z.array(
    z.object({
      tracking_number: z.string(),
      tracking_url: z.string(),
      label_url: z.string(),
    }),
  ),
  send_notification: z.boolean().optional(),
});

import { z } from "zod"

export const profilePasswordSchema = z.object({
  currentPassword: z.string().nonempty(""),
  newPassword: z.string().nonempty(""),
  confirmPassword: z.string().nonempty(""),
})

export type ProfilePasswordFormData = z.infer<typeof profilePasswordSchema>

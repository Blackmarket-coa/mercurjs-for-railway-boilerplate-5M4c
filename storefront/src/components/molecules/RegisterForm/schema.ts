import { z } from "zod"

export const registerFormSchema = z.object({
  firstName: z.string().nonempty("Please enter first name"),
  lastName: z.string().nonempty("Please enter last name"),
  email: z.string().nonempty("Please enter email").email("Invalid email"),
  password: z
    .string()
    .nonempty("Please enter password")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/, {
      message: "Password must contain at least one number or symbol",
    }),
  phone: z
    .string()
    .min(6, "Please enter phone number")
    .max(20, "Phone number is too long")
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Please enter a valid phone number (e.g., +12345678901 or 2345678901)"
    })
    .refine(
      (val) => {
        // E.164 format validation:
        // - Optional '+' prefix
        // - Must start with country code (1-3 digits, can't start with 0)
        // - Total length: 7-15 digits (excluding the '+')
        const digitsOnly = val.replace(/^\+/, '')
        return digitsOnly.length >= 7 && digitsOnly.length <= 15
      },
      { message: "Phone number must be between 7 and 15 digits" }
    ),
})

export type RegisterFormData = z.infer<typeof registerFormSchema>

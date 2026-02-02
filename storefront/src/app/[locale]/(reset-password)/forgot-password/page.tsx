"use client"

import { Button, Card } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form"
import * as z from "zod"
import { sendResetPasswordEmail } from "@/lib/data/customer"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { CheckCircle } from "@medusajs/icons"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  return (
    <main className="container flex justify-center py-8">
      <Card className="w-full max-w-md p-6">
        <FormProvider {...form}>
          <ForgotPasswordForm />
        </FormProvider>
      </Card>
    </main>
  )
}

function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<ForgotPasswordFormData>()

  const onSubmit = async (data: FieldValues) => {
    setIsSubmitting(true)
    setError("")

    try {
      const result = await sendResetPasswordEmail(data.email)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="heading-md text-primary uppercase mb-4">
          Check your email
        </h1>
        <p className="text-secondary mb-6">
          If an account exists with this email address, you will receive a
          password reset link shortly. Please check your inbox and spam folder.
        </p>
        <LocalizedClientLink href="/user">
          <Button className="w-full" size="large">
            Back to login
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="heading-md text-primary uppercase text-center mb-2">
        Forgot password?
      </h1>
      <p className="text-secondary text-center mb-6">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      <div className="space-y-4">
        <LabeledInput
          label="Email"
          placeholder="Your email address"
          type="email"
          error={errors.email as FieldError}
          {...register("email")}
        />

        {error && <p className="label-md text-negative text-center">{error}</p>}

        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>

        <p className="text-center label-md">
          Remember your password?{" "}
          <LocalizedClientLink href="/user" className="underline">
            Log in
          </LocalizedClientLink>
        </p>
      </div>
    </form>
  )
}

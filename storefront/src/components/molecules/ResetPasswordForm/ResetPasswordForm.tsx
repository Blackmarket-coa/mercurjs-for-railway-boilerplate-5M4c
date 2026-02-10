"use client"

import { Button } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { updateCustomerPassword } from "@/lib/data/customer"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, ExclamationCircle } from "@medusajs/icons"
import { useState } from "react"
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  UseFormReturn,
} from "react-hook-form"
import * as z from "zod"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(1, "New password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

type DecodedToken = {
  entity_id: string
  provider: string
  exp: number
  iat: number
}

function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

function validateToken(token: string | undefined): {
  isValid: boolean
  email?: string
  error?: string
} {
  if (!token) {
    return { isValid: false, error: "No reset token provided" }
  }

  const decoded = decodeJwtPayload(token)
  if (!decoded) {
    return { isValid: false, error: "Invalid reset token" }
  }

  if (!decoded.entity_id || !decoded.provider || !decoded.exp || !decoded.iat) {
    return { isValid: false, error: "Invalid token format" }
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  if (decoded.exp < now) {
    return { isValid: false, error: "This reset link has expired" }
  }

  return { isValid: true, email: decoded.entity_id }
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const validation = validateToken(token)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  if (!validation.isValid) {
    return <InvalidTokenView error={validation.error} />
  }

  return (
    <FormProvider {...form}>
      <ResetForm form={form} token={token!} email={validation.email} />
    </FormProvider>
  )
}

function InvalidTokenView({ error }: { error?: string }) {
  return (
    <div className="text-center p-4">
      <div className="flex justify-center mb-4">
        <ExclamationCircle className="w-12 h-12 text-negative" />
      </div>
      <h1 className="heading-md text-primary uppercase mb-4">
        Invalid Reset Link
      </h1>
      <p className="text-secondary mb-6">
        {error ||
          "This password reset link is invalid or has expired. Please request a new one."}
      </p>
      <div className="space-y-3">
        <LocalizedClientLink href="/forgot-password">
          <Button className="w-full" size="large">
            Request new reset link
          </Button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/user">
          <Button className="w-full" size="large" variant="tonal">
            Back to login
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

function ResetForm({
  form,
  token,
  email,
}: {
  form: UseFormReturn<ResetPasswordFormData>
  token: string
  email?: string
}) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    lower: true,
    upper: true,
    "8chars": true,
    symbolOrDigit: true,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useFormContext<ResetPasswordFormData>()

  const newPassword = watch("newPassword")

  const onSubmit = async (data: FieldValues) => {
    if (!passwordValidation.isValid) {
      setError("Please ensure your password meets all requirements")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await updateCustomerPassword(data.newPassword, token)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Failed to reset password. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center p-4">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="heading-md text-primary uppercase mb-4">
          Password Reset Successful
        </h1>
        <p className="text-secondary mb-6">
          Your password has been updated successfully. You can now log in with
          your new password.
        </p>
        <LocalizedClientLink href="/user">
          <Button className="w-full" size="large">
            Log in
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h1 className="heading-md text-primary uppercase text-center mb-2">
        Reset Your Password
      </h1>
      <p className="text-secondary text-center mb-6">
        Enter your new password below.
      </p>

      {email && (
        <div className="mb-4">
          <p className="label-sm text-secondary">Email</p>
          <p className="text-primary">{email}</p>
        </div>
      )}

      <div className="space-y-4">
        <LabeledInput
          label="New password"
          type="password"
          placeholder="Enter your new password"
          error={errors.newPassword as FieldError}
          {...register("newPassword")}
        />

        <PasswordValidator
          password={newPassword || ""}
          setError={setPasswordValidation}
        />

        <LabeledInput
          label="Confirm new password"
          type="password"
          placeholder="Confirm your new password"
          error={errors.confirmPassword as FieldError}
          {...register("confirmPassword")}
        />

        {error && <p className="label-md text-negative text-center">{error}</p>}

        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset password"}
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

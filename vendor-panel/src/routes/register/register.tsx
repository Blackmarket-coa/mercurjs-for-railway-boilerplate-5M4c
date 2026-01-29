import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Button, Heading, Hint, Input, Text } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { Link, useSearchParams } from "react-router-dom"
import * as z from "zod"

import { Form } from "../../components/common/form"
import AvatarBox from "../../components/common/logo-box/avatar-box"
import { VendorTypeSelection, vendorTypeOptions } from "../../components/vendor-type"
import { useSignUpWithEmailPass } from "../../hooks/api"
import { isFetchError } from "../../lib/is-fetch-error"
import { VendorType } from "../../providers/vendor-type-provider"
import { useState } from "react"

// URL validation helper
const urlSchema = z.string().url().optional().or(z.literal(""))

const RegisterSchema = z
  .object({
    name: z.string().min(2, { message: "Name should be a string" }),
    email: z.string().email({ message: "Invalid email" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/, {
        message: "Password must contain at least one number or symbol",
      }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    website_url: urlSchema,
    instagram: urlSchema,
    facebook: urlSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

function getNamePlaceholder(type: VendorType): string {
  const placeholders: Record<VendorType, string> = {
    producer: "Farm or business name",
    garden: "Garden name",
    kitchen: "Kitchen name",
    maker: "Business or studio name",
    restaurant: "Restaurant name",
    mutual_aid: "Organization name",
    default: "Company name",
  }
  return placeholders[type]
}

function getOptionalFieldsHint(type: VendorType): string {
  const hints: Record<VendorType, string> = {
    producer: "Add your farm website & social media",
    garden: "Add your garden's website & social media",
    kitchen: "Add your kitchen website & social media",
    maker: "Add your portfolio & social media",
    restaurant: "Add your restaurant website & social media",
    mutual_aid: "Add your organization's website & social media",
    default: "Add website & social links",
  }
  return hints[type]
}

export const Register = () => {
  const [step, setStep] = useState<"type" | "details">("type")
  const [selectedType, setSelectedType] = useState<VendorType | null>(null)
  const [success, setSuccess] = useState(false)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const emailFromUrl = searchParams.get("email") || ""

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: emailFromUrl,
      password: "",
      confirmPassword: "",
      website_url: "",
      instagram: "",
      facebook: "",
    },
  })

  const { mutateAsync, isPending } = useSignUpWithEmailPass()

  const handleTypeSelect = (type: VendorType) => setSelectedType(type)
  const handleContinueToDetails = () => selectedType && setStep("details")
  const handleBackToType = () => setStep("type")

  const handleSubmit = form.handleSubmit(async ({ name, email, password, confirmPassword }) => {
    await mutateAsync(
      {
        name,
        email,
        password,
        confirmPassword,
        vendor_type: selectedType || "producer",
      },
      {
        onError: (error) => {
          if (isFetchError(error) && error.status === 401) {
            form.setError("email", { type: "manual", message: error.message })
            return
          }
          form.setError("root.serverError", { type: "manual", message: error.message })
        },
        onSuccess: () => setSuccess(true),
      }
    )
  })

  const serverError = form.formState.errors?.root?.serverError?.message
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.name?.message ||
    form.formState.errors.confirmPassword?.message

  const selectedTypeInfo = selectedType ? vendorTypeOptions.find((o) => o.type === selectedType) : null

  if (success)
    return (
      <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-ui-bg-base shadow-elevation-card-rest border-ui-border-base flex flex-col items-center rounded-2xl border p-6 text-center sm:p-8">
            <div className="bg-ui-tag-green-bg mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <svg
                className="text-ui-tag-green-icon h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          <Heading>Thank You for registering!</Heading>
            <Text
              size="small"
              className="text-ui-fg-subtle mt-2 max-w-[320px] text-center"
            >
              You've registered as a <strong>{selectedTypeInfo?.title}</strong>.
              You may need to wait for admin authorization before logging in. A
              confirmation email will be sent shortly.
            </Text>
            <Link to="/login">
              <Button className="mt-8">Back to login page</Button>
            </Link>
          </div>
        </div>
      </div>
    )

  if (step === "type")
    return (
      <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="bg-ui-bg-base shadow-elevation-card-rest border-ui-border-base rounded-2xl border p-6 sm:p-8">
            <div className="mb-6 flex justify-center">
              <AvatarBox />
            </div>
            <VendorTypeSelection
              selectedType={selectedType}
              onSelect={handleTypeSelect}
              onContinue={handleContinueToDetails}
            />
            <div className="mt-6 text-center">
              <span className="text-ui-fg-muted txt-small">
                <Trans
                  i18nKey="register.alreadySeller"
                  components={[
                    <Link
                      to="/login"
                      className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover focus-visible:text-ui-fg-interactive-hover font-medium outline-none"
                    />,
                  ]}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    )

  return (
    <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-ui-bg-base shadow-elevation-card-rest border-ui-border-base flex flex-col items-center rounded-2xl border p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-4">
            <AvatarBox />
            {selectedTypeInfo && (
              <div className="bg-ui-bg-component flex items-center gap-2 rounded-full px-3 py-1.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${selectedTypeInfo.color}`}
                >
                  {selectedTypeInfo.icon}
                </span>
                <Text size="small" className="text-ui-fg-base font-medium">
                  {selectedTypeInfo.title}
                </Text>
                <button
                  type="button"
                  onClick={handleBackToType}
                  className="text-ui-fg-muted hover:text-ui-fg-base ml-1"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex flex-col items-center">
              <Heading>{t("register.title")}</Heading>
              <Text size="small" className="text-ui-fg-subtle text-center">
                {t("register.hint")}
              </Text>
            </div>
          </div>
          <div className="flex w-full flex-col gap-y-3">
            <Form {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-y-6"
              >
                <div className="flex flex-col gap-y-2">
                  {["name", "email", "password", "confirmPassword"].map(
                    (fieldName) => (
                      <Form.Field
                        key={fieldName}
                        control={form.control}
                        name={fieldName as any}
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Control>
                              <Input
                                {...field}
                                type={
                                  fieldName.includes("password")
                                    ? "password"
                                    : "text"
                                }
                                placeholder={
                                  fieldName === "name"
                                    ? getNamePlaceholder(
                                        selectedType || "default"
                                      )
                                    : fieldName === "email"
                                      ? t("fields.email")
                                      : fieldName === "confirmPassword"
                                        ? "Confirm Password"
                                        : t("fields.password")
                                }
                                className="bg-ui-bg-field-component"
                              />
                            </Form.Control>
                            <Form.ErrorMessage />
                          </Form.Item>
                        )}
                      />
                    )
                  )}
                </div>

                <div className="border-ui-border-base mt-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="text-ui-fg-interactive mx-auto flex items-center gap-1 text-sm hover:underline"
                  >
                    {showOptionalFields
                      ? "Hide"
                      : getOptionalFieldsHint(selectedType || "default")}{" "}
                    (optional)
                    <svg
                      className={`h-4 w-4 transition-transform ${showOptionalFields ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showOptionalFields &&
                    ["website_url", "instagram", "facebook"].map((field) => (
                      <Form.Field
                        key={field}
                        control={form.control}
                        name={field as any}
                        render={({ field: f }) => (
                          <Form.Item>
                            <Form.Control>
                              <Input
                                {...f}
                                className="bg-ui-bg-field-component"
                                placeholder={field.replace("_", " ").toUpperCase()}
                              />
                            </Form.Control>
                          </Form.Item>
                        )}
                      />
                    ))}
                  <Text size="xsmall" className="text-ui-fg-muted text-center">
                    You can add more links after registration
                  </Text>
                </div>

                {validationError && (
                  <Hint className="inline-flex" variant="error">
                    {validationError}
                  </Hint>
                )}
                {serverError && (
                  <Alert
                    className="bg-ui-bg-base items-center p-2"
                    dismissible
                    variant="error"
                  >
                    {serverError}
                  </Alert>
                )}

                <Button className="w-full" type="submit" isLoading={isPending}>
                  Sign up as {selectedTypeInfo?.title || "Vendor"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

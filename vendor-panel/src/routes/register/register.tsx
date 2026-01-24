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

// URL validation helper - allows empty strings
const urlSchema = z.string().url().optional().or(z.literal(""))

// Schema for the details form (step 2)
const RegisterSchema = z.object({
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
  confirmPassword: z.string().min(1, {
    message: "Please confirm your password",
  }),
  // Optional fields for social/website
  website_url: urlSchema,
  instagram: urlSchema,
  facebook: urlSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

/**
 * Get type-specific placeholder text for the name field
 */
function getNamePlaceholder(type: VendorType): string {
  const placeholders: Record<VendorType, string> = {
    producer: "Farm or business name",
    garden: "Garden name",
    maker: "Business or studio name",
    restaurant: "Restaurant name",
    mutual_aid: "Organization name",
    default: "Company name",
  }
  return placeholders[type]
}

/**
 * Get type-specific hint for the optional fields section
 */
function getOptionalFieldsHint(type: VendorType): string {
  const hints: Record<VendorType, string> = {
    producer: "Add your farm website & social media",
    garden: "Add your garden's website & social media",
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

  // Extract email from URL parameter if present
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

  const handleTypeSelect = (type: VendorType) => {
    setSelectedType(type)
  }

  const handleContinueToDetails = () => {
    if (selectedType) {
      setStep("details")
    }
  }

  const handleBackToType = () => {
    setStep("type")
  }

  const handleSubmit = form.handleSubmit(
    async ({ name, email, password, confirmPassword }) => {
      // Password matching is now handled by schema validation
      // Send registration with vendor_type selection
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
            if (isFetchError(error)) {
              if (error.status === 401) {
                form.setError("email", {
                  type: "manual",
                  message: error.message,
                })

                return
              }
            }

            form.setError("root.serverError", {
              type: "manual",
              message: error.message,
            })
          },
          onSuccess: () => {
            setSuccess(true)
          },
        }
      )
    }
  )

  const serverError = form.formState.errors?.root?.serverError?.message
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.name?.message ||
    form.formState.errors.confirmPassword?.message

  // Get selected type info for display
  const selectedTypeInfo = selectedType 
    ? vendorTypeOptions.find(o => o.type === selectedType) 
    : null

  // Success screen
  if (success)
    return (
      <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
        <div className="m-4 flex flex-col items-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-ui-tag-green-bg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-ui-tag-green-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Heading>Thank You for registering!</Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle text-center mt-2 max-w-[320px]"
          >
            You've registered as a <strong>{selectedTypeInfo?.title}</strong>. 
            You may need to wait for admin authorization before logging in. A
            confirmation email will be sent to you shortly.
          </Text>

          <Link to="/login">
            <Button className="mt-8">Back to login page</Button>
          </Link>
        </div>
      </div>
    )

  // Step 1: Type Selection
  if (step === "type") {
    return (
      <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="flex justify-center mb-6">
            <AvatarBox />
          </div>
          <VendorTypeSelection
            selectedType={selectedType}
            onSelect={handleTypeSelect}
            onContinue={handleContinueToDetails}
          />
          <div className="text-center mt-6">
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
    )
  }

  // Step 2: Details Form
  return (
    <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
      <div className="m-4 flex w-full max-w-[320px] flex-col items-center">
        <AvatarBox />
        
        {/* Type indicator */}
        {selectedTypeInfo && (
          <div className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-ui-bg-component">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedTypeInfo.color}`}>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="mb-4 flex flex-col items-center">
          <Heading>{t("register.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle text-center">
            {t("register.hint")}
          </Text>
        </div>
        <div className="flex w-full flex-col gap-y-3">
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-y-6"
            >
              <div className="flex flex-col gap-y-2">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Control>
                          <Input
                            {...field}
                            className="bg-ui-bg-field-component mb-2"
                            placeholder={getNamePlaceholder(selectedType || "default")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Control>
                          <Input
                            {...field}
                            className="bg-ui-bg-field-component"
                            placeholder={t("fields.email")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>{}</Form.Label>
                        <Form.Control>
                          <Input
                            type="password"
                            {...field}
                            className="bg-ui-bg-field-component"
                            placeholder={t("fields.password")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>{}</Form.Label>
                        <Form.Control>
                          <Input
                            type="password"
                            {...field}
                            className="bg-ui-bg-field-component"
                            placeholder="Confirm Password"
                          />
                        </Form.Control>
                        <Form.ErrorMessage />
                      </Form.Item>
                    )
                  }}
                />
              </div>
              
              {/* Optional social/website fields */}
              <div className="border-t pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="text-ui-fg-interactive text-sm hover:underline flex items-center gap-1 mx-auto"
                >
                  {showOptionalFields ? "Hide" : getOptionalFieldsHint(selectedType || "default")} (optional)
                  <svg 
                    className={`w-4 h-4 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showOptionalFields && (
                  <div className="flex flex-col gap-y-2 mt-4">
                    <Form.Field
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Control>
                            <Input
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="Website URL"
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Control>
                            <Input
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="Instagram URL"
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Control>
                            <Input
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder="Facebook URL"
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                    <Text size="xsmall" className="text-ui-fg-muted text-center">
                      You can add more links after registration
                    </Text>
                  </div>
                )}
              </div>
              
              {validationError && (
                <div className="text-center">
                  <Hint className="inline-flex" variant={"error"}>
                    {validationError}
                  </Hint>
                </div>
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
        
        {/* Back button and login link */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleBackToType}
            className="text-ui-fg-muted text-sm hover:text-ui-fg-base flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Change vendor type
          </button>
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
  )
}

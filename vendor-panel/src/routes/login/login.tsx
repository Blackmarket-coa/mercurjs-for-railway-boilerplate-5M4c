import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Button, Heading, Hint, Input, Text } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import * as z from "zod"

import { Form } from "../../components/common/form"
import AvatarBox from "../../components/common/logo-box/avatar-box"
import { useDashboardExtension } from "../../extensions"
import { useSignInWithEmailPass } from "../../hooks/api"
import { isFetchError } from "../../lib/is-fetch-error"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const reason = searchParams.get("reason") || ""

  const { getWidgets } = useDashboardExtension()

  const from = "/dashboard"

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { mutateAsync, isPending } = useSignInWithEmailPass()

  const handleSubmit = form.handleSubmit(async ({ email, password }) => {
    await mutateAsync(
      {
        email,
        password,
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
          setTimeout(() => {
            navigate(from, { replace: true })
          }, 1000)
        },
      }
    )
  })

  const serverError =
    form.formState.errors?.root?.serverError?.message || reason
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message

  return (
    <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-ui-bg-base shadow-elevation-card-rest border-ui-border-base flex flex-col items-center rounded-2xl border p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-4">
            <AvatarBox />
            <div className="flex flex-col items-center">
              <Heading>{t("login.title")}</Heading>
              <Text size="small" className="text-ui-fg-subtle text-center">
                {t("login.hint")}
              </Text>
            </div>
          </div>
          <div className="flex w-full flex-col gap-y-3">
            {getWidgets("login.before").map((Component, i) => {
              return <Component key={i} />
            })}
            <Form {...form}>
              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-y-6"
              >
                <div className="flex flex-col gap-y-2">
                  <Form.Field
                    control={form.control}
                    name="email"
                    render={({ field }) => {
                      return (
                        <Form.Item>
                          <Form.Label className="sr-only">
                            {t("fields.email")}
                          </Form.Label>
                          <Form.Control>
                            <Input
                              autoComplete="email"
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
                          <Form.Label className="sr-only">
                            {t("fields.password")}
                          </Form.Label>
                          <Form.Control>
                            <Input
                              type="password"
                              autoComplete="current-password"
                              {...field}
                              className="bg-ui-bg-field-component"
                              placeholder={t("fields.password")}
                            />
                          </Form.Control>
                        </Form.Item>
                      )
                    }}
                  />
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
                  Sign In
                </Button>
              </form>
            </Form>
            {getWidgets("login.after").map((Component, i) => {
              return <Component key={i} />
            })}
          </div>
          <div className="mt-6 flex flex-col items-center gap-4 text-center">
            <span className="text-ui-fg-muted txt-small">
              <Trans
                i18nKey="login.forgotPassword"
                components={[
                  <Link
                    key="reset-password-link"
                    to="/reset-password"
                    className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover focus-visible:text-ui-fg-interactive-hover font-medium outline-none"
                  />,
                ]}
              />
            </span>
            {__DISABLE_SELLERS_REGISTRATION__ === "false" && (
              <span className="text-ui-fg-muted txt-small">
                <Trans
                  i18nKey="login.notSellerYet"
                  components={[
                    <Link
                      to="/register"
                      className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover focus-visible:text-ui-fg-interactive-hover font-medium outline-none"
                    />,
                  ]}
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

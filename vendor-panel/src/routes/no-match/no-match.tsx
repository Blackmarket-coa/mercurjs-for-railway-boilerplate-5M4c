import { ExclamationCircle } from "@medusajs/icons"
import { Button, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export const NoMatch = () => {
  const { t } = useTranslation()

  const title = t("errorBoundary.notFoundTitle")
  const message = t("errorBoundary.noMatchMessage")

  return (
    <div className="flex min-h-screen items-center justify-center bg-ui-bg-base px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-y-6 text-center">
        <div className="flex flex-col items-center gap-y-4">
          <div className="bg-ui-bg-subtle text-ui-fg-subtle flex size-16 items-center justify-center rounded-full">
            <ExclamationCircle className="h-6 w-6" />
          </div>
          <Text size="xlarge" weight="plus">
            404
          </Text>
          <div className="flex flex-col items-center gap-y-2">
            <Text size="small" leading="compact" weight="plus">
              {title}
            </Text>
            <Text
              size="small"
              className="text-ui-fg-muted text-balance text-center"
            >
              {message}
            </Text>
          </div>
        </div>
        <Button asChild size="small" variant="secondary">
          <Link to="/">{t("errorBoundary.backToDashboard")}</Link>
        </Button>
      </div>
    </div>
  )
}

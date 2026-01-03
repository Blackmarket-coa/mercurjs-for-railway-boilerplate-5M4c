import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorMessageProps {
  error?: string | null
  "data-testid"?: string
  onRetry?: () => void
  retryLabel?: string
}

const ErrorMessage = ({
  error,
  "data-testid": dataTestid,
  onRetry,
  retryLabel = "Try again",
}: ErrorMessageProps) => {
  if (!error) {
    return null
  }

  return (
    <div
      className="pt-2 flex items-start gap-2 text-rose-500 text-small-regular"
      data-testid={dataTestid}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex flex-col gap-1">
        <span>{error}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors underline underline-offset-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage

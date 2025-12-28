import { Check, ArrowRight } from "@medusajs/icons"
import { Button, clx, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { ComponentType } from "react"

interface IconProps {
  className?: string
}

export const OnboardingRow = ({
  label,
  description,
  state,
  link,
  buttonLabel,
  stepNumber,
  icon: Icon,
}: {
  label: string
  description?: string
  state: boolean
  link: string
  buttonLabel: string
  stepNumber?: number
  icon?: ComponentType<IconProps>
}) => {
  return (
    <div 
      className={clx(
        "flex items-start justify-between p-4 rounded-lg transition-colors",
        {
          "bg-ui-bg-subtle": !state,
          "bg-ui-tag-green-bg/30": state,
        }
      )}
    >
      <div className="flex items-start gap-4">
        {/* Step indicator */}
        <div
          className={clx(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            {
              "bg-ui-bg-base border-2 border-dashed border-ui-border-strong": !state,
              "bg-ui-tag-green-bg border-2 border-ui-tag-green-icon": state,
            }
          )}
        >
          {state ? (
            <Check className="w-5 h-5 text-ui-tag-green-icon" />
          ) : (
            <span className="text-ui-fg-muted font-medium">{stepNumber}</span>
          )}
        </div>
        
        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-ui-fg-muted" />}
            <Text className={clx("font-medium", {
              "text-ui-fg-base": !state,
              "text-ui-fg-muted line-through": state,
            })}>
              {label}
            </Text>
            {state && (
              <span className="text-xs text-ui-tag-green-icon font-medium">
                ✓ Complete
              </span>
            )}
          </div>
          {description && (
            <Text className="text-ui-fg-subtle text-sm max-w-md">
              {description}
            </Text>
          )}
        </div>
      </div>
      
      {/* Action button */}
      <Link to={link}>
        <Button 
          variant={state ? "transparent" : "primary"}
          size="small"
          className="min-w-[100px] gap-2"
        >
          {state ? "Edit" : buttonLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  )
}

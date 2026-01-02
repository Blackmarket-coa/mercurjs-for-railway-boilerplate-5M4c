import { clx } from "@medusajs/ui"
import { VendorType } from "../../providers/vendor-type-provider"

export interface VendorTypeOption {
  type: VendorType
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

interface VendorTypeCardProps {
  option: VendorTypeOption
  selected: boolean
  onSelect: (type: VendorType) => void
}

export function VendorTypeCard({ option, selected, onSelect }: VendorTypeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.type)}
      className={clx(
        "relative flex flex-col items-center p-4 rounded-lg border-2 transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
        selected
          ? "border-ui-fg-interactive bg-ui-bg-interactive-hover ring-2 ring-ui-fg-interactive"
          : "border-ui-border-base bg-ui-bg-field hover:border-ui-fg-muted"
      )}
    >
      {/* Icon */}
      <div 
        className={clx(
          "w-12 h-12 rounded-full flex items-center justify-center mb-3",
          option.color
        )}
      >
        {option.icon}
      </div>
      
      {/* Title */}
      <h3 className={clx(
        "text-sm font-semibold mb-1",
        selected ? "text-ui-fg-interactive" : "text-ui-fg-base"
      )}>
        {option.title}
      </h3>
      
      {/* Description */}
      <p className="text-xs text-ui-fg-muted text-center leading-relaxed">
        {option.description}
      </p>
      
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-ui-fg-interactive" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  )
}

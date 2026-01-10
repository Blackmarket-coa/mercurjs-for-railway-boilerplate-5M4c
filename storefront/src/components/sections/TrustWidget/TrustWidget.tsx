"use client"

import { useState } from "react"
import { CollapseIcon, HeartIcon } from "@/icons"

interface TrustWidgetProps {
  /** Percentage going to the producer (0-100) */
  producerPercentage?: number
  /** Percentage going to the coalition (0-100) */
  platformPercentage?: number
  /** Cart total in cents */
  cartTotal?: number
  /** Currency code */
  currencyCode?: string
  /** Whether to start expanded */
  defaultExpanded?: boolean
  /** Optional producer name to personalize */
  producerName?: string
  /** Visual variant */
  variant?: "default" | "compact"
}

interface BreakdownItemProps {
  label: string
  percentage: number
  amount?: string
  icon: React.ReactNode
  color: string
  description?: string
}

function BreakdownItem({
  label,
  percentage,
  amount,
  icon,
  color,
  description,
}: BreakdownItemProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{label}</span>
          <div className="text-right">
            <span className="font-semibold text-gray-900">{percentage}%</span>
            {amount && (
              <span className="text-sm text-gray-500 ml-2">({amount})</span>
            )}
          </div>
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}

function formatCurrency(amountInCents: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amountInCents / 100)
}

// Inline SVG icons to avoid missing import issues
function ShopSvgIcon({ size = 20, color = "#15803d" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function TrustWidget({
  producerPercentage = 97,
  platformPercentage = 3,
  cartTotal,
  currencyCode = "USD",
  defaultExpanded = false,
  producerName,
  variant = "default",
}: TrustWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Calculate actual amounts if cart total is provided
  const producerAmount = cartTotal
    ? formatCurrency((cartTotal * producerPercentage) / 100, currencyCode)
    : undefined
  const platformAmount = cartTotal
    ? formatCurrency((cartTotal * platformPercentage) / 100, currencyCode)
    : undefined

  const breakdownItems: BreakdownItemProps[] = [
    {
      label: producerName ? `${producerName}` : "Local Producer",
      percentage: producerPercentage,
      amount: producerAmount,
      icon: <ShopSvgIcon size={20} color="#15803d" />,
      color: "bg-green-100",
      description: "Directly supports the grower and their sustainable practices",
    },
    {
      label: "Coalition",
      percentage: platformPercentage,
      amount: platformAmount,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      color: "bg-blue-100",
      description: "Keeps the marketplace running—no additional fees",
    },
  ]

  if (variant === "compact") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <HeartIcon size={18} color="#166534" />
          <span className="text-sm font-medium">
            {producerPercentage}% goes directly to{" "}
            {producerName || "local producers"}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-green-700 underline mt-1 hover:text-green-900 transition-colors"
        >
          {isExpanded ? "Hide breakdown" : "See full breakdown"}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
            {breakdownItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-green-800">{item.label}</span>
                <span className="font-medium text-green-900">
                  {item.percentage}%
                  {item.amount && (
                    <span className="text-green-700 ml-1">({item.amount})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <HeartIcon size={16} color="#15803d" />
          </div>
          <div className="text-left">
            <h4 className="font-medium text-gray-900 text-sm">
              Where Your Money Goes
            </h4>
            <p className="text-xs text-gray-500">
              {producerPercentage}% directly to{" "}
              {producerName || "local producers"}
            </p>
          </div>
        </div>
        <CollapseIcon
          size={20}
          className={`transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable breakdown */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Visual bar */}
          <div className="flex h-3 rounded-full overflow-hidden my-4">
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${producerPercentage}%` }}
              title={`Producer: ${producerPercentage}%`}
            />
            <div
              className="bg-blue-500 transition-all"
              style={{ width: `${platformPercentage}%` }}
              title={`Coalition: ${platformPercentage}%`}
            />
          </div>

          {/* Detailed breakdown */}
          <div className="divide-y divide-gray-100">
            {breakdownItems.map((item) => (
              <BreakdownItem key={item.label} {...item} />
            ))}
          </div>

          {/* Trust message */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              We believe in transparent pricing. Every purchase strengthens our
              local food system.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrustWidget

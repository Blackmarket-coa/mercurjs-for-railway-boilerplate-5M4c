"use client"

import { useState } from "react"

// Inline SVG Icons
const ChevronDownIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)

const ChevronUpIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
)

const InformationCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
)

const CurrencyDollarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
)

const BuildingStorefrontIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
)

const TruckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const HeartIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
)

interface BreakdownItem {
  type: string
  label: string
  amount: number
  percent: number
  description: string
  recipient?: string
  highlight?: boolean
}

interface PriceTransparencyWidgetProps {
  orderTotal: number
  breakdown: BreakdownItem[]
  producerName?: string
  currency?: string
  className?: string
  defaultExpanded?: boolean
}

/**
 * Price Transparency Widget
 * 
 * Shows customers exactly where their money goes.
 * "UI must show *why* the price makes sense."
 */
export const PriceTransparencyWidget = ({
  orderTotal,
  breakdown,
  producerName,
  currency = "USD",
  className = "",
  defaultExpanded = false,
}: PriceTransparencyWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  // Calculate producer percentage
  const producerItem = breakdown.find(item => item.type === "PRODUCER_PRICE")
  const producerPercent = producerItem?.percent || 0
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100)
  }
  
  const getIcon = (type: string) => {
    switch (type) {
      case "PRODUCER_PRICE":
        return UserIcon
      case "PLATFORM_FEE":
      case "COALITION_FEE":
        return BuildingStorefrontIcon
      case "DELIVERY_FEE":
        return TruckIcon
      case "COMMUNITY_FUND":
        return HeartIcon
      default:
        return CurrencyDollarIcon
    }
  }

  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
          >
            <span className="text-lg font-bold text-green-700">{producerPercent}%</span>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">
              {producerPercent}% goes to {producerName || "the producer"}
            </p>
            <p className="text-sm text-gray-500">
              Click to see full breakdown
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {/* Expanded breakdown */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-3">
            Where your {formatPrice(orderTotal)} goes:
          </h4>
          
          <div className="space-y-3">
            {breakdown.map((item, index) => {
              const Icon = getIcon(item.type)
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.highlight 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-white border"
                  }`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.highlight ? "bg-green-200" : "bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.highlight ? "text-green-700" : "text-gray-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${item.highlight ? "text-green-800" : "text-gray-900"}`}>
                        {item.label}
                      </span>
                      <div className="text-right">
                        <span className={`font-semibold ${item.highlight ? "text-green-700" : "text-gray-900"}`}>
                          {formatPrice(item.amount)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({item.percent}%)
                        </span>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    )}
                    {item.recipient && item.type === "PRODUCER_PRICE" && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        → Goes directly to {item.recipient}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Comparison callout */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">
                  At a typical grocery store...
                </p>
                <p className="text-blue-700 mt-1">
                  Producers typically receive only 15-20% of the retail price.
                  When you buy direct, they get {producerPercent}%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface WhereYourMoneyGoesProps {
  producerPercent: number
  platformPercent: number
  deliveryPercent?: number
  communityPercent?: number
  producerName?: string
  className?: string
}

/**
 * Simplified "Where Your Money Goes" visual
 * For product pages - hover/click for details
 */
export const WhereYourMoneyGoes = ({
  producerPercent,
  platformPercent,
  deliveryPercent = 0,
  communityPercent = 0,
  producerName,
  className = "",
}: WhereYourMoneyGoesProps) => {
  const [showDetails, setShowDetails] = useState(false)
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-left"
      >
        {/* Visual bar */}
        <div className="h-3 rounded-full overflow-hidden flex">
          <div 
            className="bg-green-500 transition-all"
            style={{ width: `${producerPercent}%` }}
            title={`${producerPercent}% to producer`}
          />
          <div
            className="bg-blue-400 transition-all"
            style={{ width: `${platformPercent}%` }}
            title={`${platformPercent}% coalition fee`}
          />
          {deliveryPercent > 0 && (
            <div 
              className="bg-amber-400 transition-all"
              style={{ width: `${deliveryPercent}%` }}
              title={`${deliveryPercent}% delivery`}
            />
          )}
          {communityPercent > 0 && (
            <div 
              className="bg-pink-400 transition-all"
              style={{ width: `${communityPercent}%` }}
              title={`${communityPercent}% community fund`}
            />
          )}
        </div>
        
        {/* Label */}
        <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1">
          <span className="text-green-600 font-medium">{producerPercent}%</span>
          <span>goes to {producerName || "the producer"}</span>
          <InformationCircleIcon className="w-4 h-4 text-gray-400" />
        </p>
      </button>
      
      {/* Details tooltip */}
      {showDetails && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute z-50 top-full left-0 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Producer
                </span>
                <span className="font-medium">{producerPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  Coalition
                </span>
                <span className="font-medium">{platformPercent}%</span>
              </div>
              {deliveryPercent > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    Delivery
                  </span>
                  <span className="font-medium">{deliveryPercent}%</span>
                </div>
              )}
              {communityPercent > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-400" />
                    Community Fund
                  </span>
                  <span className="font-medium">{communityPercent}%</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
              You&apos;re paying the producer directly. They set the price. They get paid.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

interface PriceComparisonProps {
  directPrice: number
  groceryPrice?: number
  producerPercent: number
  currency?: string
  className?: string
}

/**
 * Price Comparison Component
 * Shows direct price vs grocery equivalent
 */
export const PriceComparison = ({
  directPrice,
  groceryPrice,
  producerPercent,
  currency = "USD",
  className = "",
}: PriceComparisonProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }
  
  if (!groceryPrice) {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        <span className="text-green-600 font-medium">{producerPercent}%</span> of your purchase goes directly to the producer
      </div>
    )
  }
  
  const savings = groceryPrice - directPrice
  const savingsPercent = Math.round((savings / groceryPrice) * 100)
  
  return (
    <div className={`p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Grocery store price</span>
        <span className="text-sm text-gray-500 line-through">{formatPrice(groceryPrice)}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">Direct price</span>
        <span className="text-lg font-bold text-green-600">{formatPrice(directPrice)}</span>
      </div>
      {savings > 0 && (
        <p className="text-sm text-green-600">
          Save {formatPrice(savings)} ({savingsPercent}%) while the producer gets more!
        </p>
      )}
      {savings <= 0 && (
        <p className="text-sm text-gray-600">
          Pay {formatPrice(Math.abs(savings))} more to support a local producer directly
        </p>
      )}
    </div>
  )
}

export default PriceTransparencyWidget

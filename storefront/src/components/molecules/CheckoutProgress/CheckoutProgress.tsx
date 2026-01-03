"use client"

import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

interface CheckoutProgressProps {
  cart: HttpTypes.StoreCart
}

const steps = [
  { key: "address", label: "Address", number: 1 },
  { key: "delivery", label: "Delivery", number: 2 },
  { key: "payment", label: "Payment", number: 3 },
] as const

type StepKey = typeof steps[number]["key"]

/** Determines the current step based on cart state and URL */
function getCurrentStep(cart: HttpTypes.StoreCart, urlStep: string | null): StepKey {
  // If URL has a step param, use that
  if (urlStep && ["address", "delivery", "payment"].includes(urlStep)) {
    return urlStep as StepKey
  }
  
  // Otherwise, determine from cart state
  const hasAddress = Boolean(
    cart.shipping_address?.address_1 &&
    cart.shipping_address?.city &&
    cart.shipping_address?.country_code
  )
  
  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0
  
  if (!hasAddress) return "address"
  if (!hasShippingMethod) return "delivery"
  return "payment"
}

/** Check icon for completed steps */
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

export const CheckoutProgress = ({ cart }: CheckoutProgressProps) => {
  const searchParams = useSearchParams()
  const urlStep = searchParams.get("step")
  const currentStep = getCurrentStep(cart, urlStep)
  
  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isUpcoming = index > currentStepIndex

          return (
            <li key={step.key} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                    transition-all duration-200
                    ${isCompleted 
                      ? "bg-green-600 text-white" 
                      : isCurrent 
                        ? "bg-green-600 text-white ring-4 ring-green-100" 
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <CheckIcon /> : step.number}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${isCurrent ? "text-green-600" : isCompleted ? "text-gray-900" : "text-gray-500"}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-16 sm:w-24 h-1 mx-2 sm:mx-4 rounded
                    ${index < currentStepIndex ? "bg-green-600" : "bg-gray-200"}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
      
      {/* Screen reader text */}
      <p className="sr-only">
        Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}
      </p>
    </nav>
  )
}

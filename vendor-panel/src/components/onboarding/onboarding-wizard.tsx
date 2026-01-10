import { useState } from "react"
import { Button, Container, Heading, Text, Badge, clx } from "@medusajs/ui"
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircleSolid,
  BuildingStorefront,
  Tag,
} from "@medusajs/icons"
import { useNavigate } from "react-router-dom"
import { useVendorType, VendorType } from "../../providers/vendor-type-provider"

/**
 * Welcome Step - Introduction based on vendor type
 */
function WelcomeStep({ onComplete, vendorType }: { 
  onComplete: () => void
  vendorType: VendorType
}) {
  const getWelcomeContent = () => {
    switch (vendorType) {
      case "producer":
        return {
          title: "Welcome, Producer! 🌱",
          subtitle: "Let's set up your farm store",
          description: "We'll help you create a beautiful storefront to showcase your farm products. This wizard will guide you through adding your farm details, products, and shipping options.",
          benefits: [
            "Reach local customers looking for fresh, local produce",
            "Manage orders and inventory in one place",
            "Set up seasonal availability and subscriptions",
          ],
        }
      case "garden":
        return {
          title: "Welcome, Garden! 🥕",
          subtitle: "Let's set up your community garden",
          description: "We'll help you organize your garden's offerings. This wizard will guide you through setting up plots, volunteer management, and harvest shares.",
          benefits: [
            "Manage garden plots and member assignments",
            "Coordinate volunteer schedules",
            "Share harvests with your community",
          ],
        }
      case "maker":
        return {
          title: "Welcome, Maker! ✨",
          subtitle: "Let's showcase your creations",
          description: "We'll help you build a storefront for your handmade goods. This wizard will guide you through adding your story, products, and fulfillment options.",
          benefits: [
            "Tell your craft story to connect with customers",
            "Beautifully display your handmade products",
            "Manage custom orders and inventory",
          ],
        }
      case "restaurant":
        return {
          title: "Welcome, Chef! 🍴",
          subtitle: "Let's set up your restaurant",
          description: "We'll help you get your menu online. This wizard will guide you through adding your restaurant details, menu items, and delivery options.",
          benefits: [
            "Create an appealing digital menu",
            "Accept orders for pickup or delivery",
            "Manage your kitchen workflow",
          ],
        }
      case "mutual_aid":
        return {
          title: "Welcome, Community Builder! 💜",
          subtitle: "Let's set up your mutual aid network",
          description: "We'll help you organize your community support. This wizard will guide you through setting up resources, volunteers, and service areas.",
          benefits: [
            "Coordinate community resources effectively",
            "Manage volunteer schedules and tasks",
            "Track donations and distributions",
          ],
        }
      default:
        return {
          title: "Welcome! 👋",
          subtitle: "Let's set up your store",
          description: "We'll help you create your storefront. This wizard will guide you through the essential setup steps.",
          benefits: [
            "Create a professional storefront",
            "Reach new customers",
            "Manage your business efficiently",
          ],
        }
    }
  }

  const content = getWelcomeContent()

  return (
    <div className="text-center max-w-xl mx-auto py-8">
      <Heading level="h1" className="text-3xl mb-2">
        {content.title}
      </Heading>
      <Text className="text-ui-fg-subtle text-lg mb-8">
        {content.subtitle}
      </Text>
      
      <div className="text-left bg-ui-bg-subtle rounded-lg p-6 mb-8">
        <Text className="mb-4">{content.description}</Text>
        
        <div className="space-y-3 mt-6">
          <Text className="font-medium text-sm text-ui-fg-muted uppercase tracking-wide">
            What you'll get:
          </Text>
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircleSolid className="w-5 h-5 text-ui-tag-green-icon flex-shrink-0 mt-0.5" />
              <Text className="text-ui-fg-base">{benefit}</Text>
            </div>
          ))}
        </div>
      </div>

      <Button size="large" onClick={onComplete}>
        Get Started
        <ArrowRight className="ml-2" />
      </Button>
    </div>
  )
}

/**
 * Store Profile Step Placeholder
 */
function StoreProfileStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const { vendorType } = useVendorType()
  
  const getProfilePrompts = () => {
    switch (vendorType) {
      case "producer":
        return {
          title: "Tell Your Farm Story",
          fields: ["Farm name", "Your story", "Growing practices", "Location"],
        }
      case "garden":
        return {
          title: "Describe Your Garden",
          fields: ["Garden name", "Mission", "Location", "Hours"],
        }
      default:
        return {
          title: "Complete Your Profile",
          fields: ["Store name", "Description", "Contact info", "Location"],
        }
    }
  }

  const prompts = getProfilePrompts()

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <BuildingStorefront className="w-12 h-12 text-ui-fg-muted mx-auto mb-4" />
        <Heading level="h2" className="mb-2">{prompts.title}</Heading>
        <Text className="text-ui-fg-subtle">
          Share who you are so customers can connect with you.
        </Text>
      </div>

      <div className="bg-ui-bg-subtle rounded-lg p-6 mb-8">
        <Text className="text-ui-fg-muted text-sm mb-4">
          You'll add these details in the next step:
        </Text>
        <ul className="space-y-2">
          {prompts.fields.map((field, index) => (
            <li key={index} className="flex items-center gap-2 text-ui-fg-base">
              <div className="w-1.5 h-1.5 rounded-full bg-ui-fg-muted" />
              {field}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        <Button onClick={onComplete}>
          Continue to Profile
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Completion Step
 */
function CompletionStep() {
  const navigate = useNavigate()
  const { typeLabel } = useVendorType()

  const handleGoToDashboard = () => {
    navigate("/dashboard")
  }

  const handleGoToProfile = () => {
    navigate("/settings/store")
  }

  return (
    <div className="text-center max-w-xl mx-auto py-8">
      <div className="w-16 h-16 rounded-full bg-ui-tag-green-bg flex items-center justify-center mx-auto mb-6">
        <CheckCircleSolid className="w-8 h-8 text-ui-tag-green-icon" />
      </div>
      
      <Heading level="h1" className="text-2xl mb-2">
        You're All Set! 🎉
      </Heading>
      <Text className="text-ui-fg-subtle mb-8">
        Your {typeLabel.toLowerCase()} account is ready. Here's what to do next.
      </Text>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleGoToProfile}
          className="p-4 rounded-lg border border-ui-border-base hover:border-ui-fg-muted transition-colors text-left group"
        >
          <BuildingStorefront className="w-6 h-6 text-ui-fg-muted group-hover:text-ui-fg-base mb-2" />
          <Text className="font-medium">Complete Your Profile</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Add your full details and story
          </Text>
        </button>

        <button
          onClick={() => navigate("/products/create")}
          className="p-4 rounded-lg border border-ui-border-base hover:border-ui-fg-muted transition-colors text-left group"
        >
          <Tag className="w-6 h-6 text-ui-fg-muted group-hover:text-ui-fg-base mb-2" />
          <Text className="font-medium">Add Your First Product</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Start offering right away
          </Text>
        </button>
      </div>

      <Button size="large" onClick={handleGoToDashboard}>
        Go to Dashboard
      </Button>
    </div>
  )
}

/**
 * Main Onboarding Wizard Component
 */
export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const { vendorType, isLoading } = useVendorType()

  const steps = [
    { id: "welcome", title: "Welcome" },
    { id: "profile", title: "Profile" },
    { id: "complete", title: "Complete" },
  ]

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Loading...</Text>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ui-bg-base">
      {/* Progress Header */}
      <div className="border-b border-ui-border-base bg-ui-bg-subtle">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge color="blue">Setup Wizard</Badge>
              <Text className="text-ui-fg-subtle">
                Step {currentStep + 1} of {steps.length}
              </Text>
            </div>
            
            {/* Step indicators */}
            <div className="hidden md:flex items-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={clx(
                    "flex items-center gap-2",
                    index < steps.length - 1 && "pr-4"
                  )}
                >
                  <div
                    className={clx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      index < currentStep
                        ? "bg-ui-tag-green-bg text-ui-tag-green-icon"
                        : index === currentStep
                        ? "bg-ui-bg-interactive text-ui-fg-on-color"
                        : "bg-ui-bg-component text-ui-fg-muted"
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircleSolid className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <Text
                    size="small"
                    className={clx(
                      index <= currentStep ? "text-ui-fg-base" : "text-ui-fg-muted"
                    )}
                  >
                    {step.title}
                  </Text>
                  {index < steps.length - 1 && (
                    <div
                      className={clx(
                        "w-8 h-0.5 ml-2",
                        index < currentStep ? "bg-ui-tag-green-icon" : "bg-ui-border-base"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Step Content */}
      <Container className="py-8">
        {currentStep === 0 && (
          <WelcomeStep
            onComplete={handleNext}
            vendorType={vendorType}
          />
        )}
        {currentStep === 1 && (
          <StoreProfileStep onComplete={handleNext} onBack={handleBack} />
        )}
        {currentStep === 2 && (
          <CompletionStep />
        )}
      </Container>
    </div>
  )
}

export default OnboardingWizard

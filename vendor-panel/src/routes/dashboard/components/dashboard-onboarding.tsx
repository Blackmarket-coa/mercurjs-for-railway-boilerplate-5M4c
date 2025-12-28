import { 
  Container, 
  Heading, 
  Text, 
  Badge,
  Button,
} from "@medusajs/ui"
import { OnboardingRow } from "./onboarding-row"
import { useUpdateOnboarding } from "../../../hooks/api"
import { useEffect, useState } from "react"
import { 
  BuildingStorefront, 
  ShoppingCart, 
  MapPin, 
  QuestionMarkCircle,
  BookOpen,
  LightBulb,
  ArrowRight,
} from "@medusajs/icons"
import { Link } from "react-router-dom"

type DashboardProps = {
  products: boolean
  locations_shipping: boolean
  store_information: boolean
  stripe_connect: boolean
}

// Quick tips for beginners
const BEGINNER_TIPS = [
  {
    icon: LightBulb,
    title: "High-quality photos sell",
    description: "Products with clear, professional photos get 3x more views. Use natural lighting and show multiple angles.",
  },
  {
    icon: LightBulb,
    title: "Price competitively",
    description: "Research similar products on the marketplace. Competitive pricing helps you get discovered.",
  },
  {
    icon: LightBulb,
    title: "Respond quickly",
    description: "Vendors who respond to messages within 24 hours have 50% higher conversion rates.",
  },
]

// Help resources
const HELP_RESOURCES = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of selling on our marketplace",
    link: "#",
    icon: BookOpen,
  },
  {
    title: "Shipping Best Practices",
    description: "Set up shipping zones and rates effectively",
    link: "/settings/locations",
    icon: MapPin,
  },
  {
    title: "Need Help?",
    description: "Contact our vendor support team",
    link: "#",
    icon: QuestionMarkCircle,
  },
]

export const DashboardOnboarding = ({
  products,
  locations_shipping,
  store_information,
  // stripe_connect,
}: DashboardProps) => {
  const { mutateAsync } = useUpdateOnboarding()
  const [showTips, setShowTips] = useState(true)

  useEffect(() => {
    mutateAsync()
  }, [])

  // Calculate progress
  const completedSteps = [store_information, locations_shipping, products].filter(Boolean).length
  const totalSteps = 3
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="space-y-4">
      {/* Welcome Header with Progress */}
      <Container className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-ui-bg-subtle to-ui-bg-base px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge color="green" className="mb-2">Getting Started</Badge>
              <Heading level="h1" className="text-2xl">
                Welcome to Your Vendor Dashboard! 🎉
              </Heading>
              <Text className="text-ui-fg-subtle max-w-lg">
                You're just a few steps away from launching your store. Complete the setup below 
                to start reaching customers and making sales.
              </Text>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="text-right">
                <Text className="text-ui-fg-subtle text-sm">Setup Progress</Text>
                <Text className="text-2xl font-bold text-ui-fg-base">{progressPercent}%</Text>
              </div>
              <div className="w-32 h-2 bg-ui-bg-switch rounded-full overflow-hidden">
                <div 
                  className="h-full bg-ui-tag-green-icon rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Setup Steps */}
        <div className="px-6 py-4 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Text className="font-medium">Complete these steps to start selling:</Text>
            <Badge size="xsmall">{completedSteps}/{totalSteps} Complete</Badge>
          </div>
          
          <OnboardingRow
            label="Set up your store profile"
            description="Add your store name, logo, and description so customers know who you are."
            state={store_information}
            link="/settings/store"
            buttonLabel="Set Up Store"
            stepNumber={1}
            icon={BuildingStorefront}
          />
          
          <OnboardingRow
            label="Configure shipping & locations"
            description="Tell us where you ship from and set your shipping rates. This is required before you can sell."
            state={locations_shipping}
            link="/settings/locations"
            buttonLabel="Add Location"
            stepNumber={2}
            icon={MapPin}
          />
          
          <OnboardingRow
            label="Add your first product"
            description="List your products with photos, descriptions, and prices. You can always add more later!"
            state={products}
            link="/products/create"
            buttonLabel="Add Product"
            stepNumber={3}
            icon={ShoppingCart}
          />
        </div>
      </Container>

      {/* Tips for Success */}
      {showTips && (
        <Container className="p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
            <div className="flex items-center gap-2">
              <LightBulb className="text-ui-tag-orange-icon" />
              <Heading level="h2">Tips for Success</Heading>
            </div>
            <Button 
              variant="transparent" 
              size="small"
              onClick={() => setShowTips(false)}
            >
              Dismiss
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {BEGINNER_TIPS.map((tip, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg bg-ui-bg-subtle border border-ui-border-base"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-ui-tag-orange-bg">
                    <tip.icon className="w-4 h-4 text-ui-tag-orange-icon" />
                  </div>
                  <div>
                    <Text className="font-medium text-ui-fg-base">{tip.title}</Text>
                    <Text className="text-ui-fg-subtle text-sm mt-1">{tip.description}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* Quick Links & Resources */}
      <Container className="p-0">
        <div className="px-6 py-4 border-b border-ui-border-base">
          <div className="flex items-center gap-2">
            <QuestionMarkCircle className="text-ui-fg-muted" />
            <Heading level="h2">Need Help?</Heading>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ui-border-base">
          {HELP_RESOURCES.map((resource, index) => (
            <Link 
              key={index}
              to={resource.link}
              className="flex items-center gap-4 p-6 hover:bg-ui-bg-subtle transition-colors group"
            >
              <div className="p-3 rounded-lg bg-ui-bg-subtle group-hover:bg-ui-bg-base transition-colors">
                <resource.icon className="w-5 h-5 text-ui-fg-muted" />
              </div>
              <div className="flex-1">
                <Text className="font-medium text-ui-fg-base">{resource.title}</Text>
                <Text className="text-ui-fg-subtle text-sm">{resource.description}</Text>
              </div>
              <ArrowRight className="w-4 h-4 text-ui-fg-muted group-hover:text-ui-fg-base transition-colors" />
            </Link>
          ))}
        </div>
      </Container>
    </div>
  )
}

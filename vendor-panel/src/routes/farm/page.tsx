import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, Calendar, Map, Sun, QuestionMarkCircle, CheckCircle, InformationCircle, ArrowRight, CubeSolid } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Tooltip,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import { sdk } from "../../lib/sdk"
import { ProducerDTO, GrowingPracticeLabels, GrowingPractice } from "../../types/domain"

// Helpful tips for new farm vendors
const FARM_TIPS = [
  {
    icon: "🌱",
    title: "Start with a Harvest",
    description: "Log your first harvest to begin tracking your produce through to sale."
  },
  {
    icon: "📦",
    title: "Create Lots",
    description: "Break harvests into lots for better inventory tracking and quality grading."
  },
  {
    icon: "🛒",
    title: "Link to Products",
    description: "Connect lots to your store products to make them available for purchase."
  }
]

// Getting started steps
const GETTING_STARTED_STEPS = [
  { key: "profile", label: "Set up farm profile", icon: Sun },
  { key: "harvest", label: "Log your first harvest", icon: Calendar },
  { key: "lot", label: "Create a lot", icon: CubeSolid },
  { key: "link", label: "Link to a product", icon: ArrowRight },
]

interface FarmDashboardStats {
  active_harvests: number
  total_lots: number
  available_products: number
  pending_orders: number
}

interface CompletedSteps {
  profile: boolean
  harvest: boolean
  lot: boolean
  link: boolean
}

const useFarmProfile = () => {
  return useQuery({
    queryKey: ["farm-profile"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ producer: ProducerDTO }>("/vendor/farm/profile")
      return response.producer
    },
  })
}

const useFarmStats = () => {
  return useQuery({
    queryKey: ["farm-stats"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ stats: FarmDashboardStats }>("/vendor/farm/stats")
      return response.stats
    },
  })
}

const FarmDashboardPage = () => {
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading } = useFarmProfile()
  const { data: stats, isLoading: statsLoading } = useFarmStats()
  const [showTips, setShowTips] = useState(true)

  const isLoading = profileLoading || statsLoading

  // Calculate completed steps for progress
  const completedSteps: CompletedSteps = {
    profile: !!profile,
    harvest: (stats?.active_harvests ?? 0) > 0,
    lot: (stats?.total_lots ?? 0) > 0,
    link: (stats?.available_products ?? 0) > 0,
  }
  const stepsCompleted = Object.values(completedSteps).filter(Boolean).length
  const totalSteps = Object.keys(completedSteps).length
  const progressPercent = Math.round((stepsCompleted / totalSteps) * 100)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4">
        <Container className="divide-y p-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // If no profile exists, show setup prompt
  if (!profile) {
    return (
      <div className="flex flex-col gap-y-4">
        <Container className="p-6">
          <div className="flex flex-col items-center justify-center py-10 gap-y-4">
            <div className="w-20 h-20 rounded-full bg-ui-bg-subtle flex items-center justify-center mb-2">
              <Sun className="w-10 h-10 text-ui-fg-muted" />
            </div>
            <Badge color="green" size="small">🌿 Getting Started</Badge>
            <Heading level="h2">Welcome to Farm Manager!</Heading>
            <Text className="text-ui-fg-subtle text-center max-w-lg">
              This is where you'll manage your farm's entire harvest-to-sale workflow.
              Let's start by setting up your farm profile so customers can learn about you.
            </Text>
            
            {/* What you'll be able to do */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 w-full max-w-lg mt-4">
              <Text className="font-medium mb-3">With Farm Manager, you can:</Text>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-ui-fg-success mt-0.5" />
                  <div>
                    <Text className="font-medium">Track harvests</Text>
                    <Text className="text-ui-fg-subtle text-sm">Log when and what you harvest, with photos and notes</Text>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-ui-fg-success mt-0.5" />
                  <div>
                    <Text className="font-medium">Manage inventory</Text>
                    <Text className="text-ui-fg-subtle text-sm">Break harvests into lots with grades and quantities</Text>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-ui-fg-success mt-0.5" />
                  <div>
                    <Text className="font-medium">Sell your produce</Text>
                    <Text className="text-ui-fg-subtle text-sm">Link lots to products and start accepting orders</Text>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate("/farm/profile/create")}
            >
              <Sun className="w-4 h-4 mr-2" />
              Create Your Farm Profile
            </Button>
            
            <Text className="text-ui-fg-muted text-sm mt-2">
              Takes about 2 minutes to complete
            </Text>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Getting Started Progress - Show if not all steps complete */}
      {stepsCompleted < totalSteps && (
        <Container className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <InformationCircle className="w-5 h-5 text-green-600" />
              <Heading level="h3" className="text-green-800">Getting Started</Heading>
              <Badge color="green" size="xsmall">{stepsCompleted}/{totalSteps} complete</Badge>
            </div>
            <Text className="text-green-700 font-medium">{progressPercent}%</Text>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-green-100 rounded-full h-2 mb-4">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-4 gap-3">
            {GETTING_STARTED_STEPS.map((step, index) => {
              const isComplete = completedSteps[step.key as keyof CompletedSteps]
              return (
                <div 
                  key={step.key}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    isComplete 
                      ? "bg-green-100 text-green-700" 
                      : "bg-white text-ui-fg-subtle"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                  )}
                  <Text className={`text-sm ${isComplete ? "line-through" : ""}`}>
                    {step.label}
                  </Text>
                </div>
              )
            })}
          </div>
        </Container>
      )}

      {/* Header */}
      <Container className="p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Sun className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h1">{profile.name}</Heading>
                {profile.verified && (
                  <Badge color="green" size="small">Verified</Badge>
                )}
                {profile.featured && (
                  <Badge color="purple" size="small">Featured</Badge>
                )}
              </div>
              {profile.region && (
                <Text className="text-ui-fg-subtle">
                  <Map className="w-4 h-4 inline mr-1" />
                  {profile.region}{profile.state ? `, ${profile.state}` : ""}
                </Text>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/farm/profile/edit")}
          >
            Edit Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6">
          <Tooltip content="Harvests currently in progress or recently completed">
            <div className="flex flex-col cursor-help hover:bg-ui-bg-subtle p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-1">
                <Text className="text-ui-fg-subtle text-sm">Active Harvests</Text>
                <QuestionMarkCircle className="w-3.5 h-3.5 text-ui-fg-muted" />
              </div>
              <Text className="text-2xl font-semibold">{stats?.active_harvests ?? 0}</Text>
              {(stats?.active_harvests ?? 0) === 0 && (
                <Text className="text-xs text-ui-fg-muted">Log a harvest to get started</Text>
              )}
            </div>
          </Tooltip>
          <Tooltip content="Individual inventory lots created from your harvests">
            <div className="flex flex-col cursor-help hover:bg-ui-bg-subtle p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-1">
                <Text className="text-ui-fg-subtle text-sm">Total Lots</Text>
                <QuestionMarkCircle className="w-3.5 h-3.5 text-ui-fg-muted" />
              </div>
              <Text className="text-2xl font-semibold">{stats?.total_lots ?? 0}</Text>
              {(stats?.total_lots ?? 0) === 0 && (
                <Text className="text-xs text-ui-fg-muted">Create lots from harvests</Text>
              )}
            </div>
          </Tooltip>
          <Tooltip content="Lots that are linked to products and available for purchase">
            <div className="flex flex-col cursor-help hover:bg-ui-bg-subtle p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-1">
                <Text className="text-ui-fg-subtle text-sm">Available Products</Text>
                <QuestionMarkCircle className="w-3.5 h-3.5 text-ui-fg-muted" />
              </div>
              <Text className="text-2xl font-semibold">{stats?.available_products ?? 0}</Text>
              {(stats?.available_products ?? 0) === 0 && (
                <Text className="text-xs text-ui-fg-muted">Link lots to products to sell</Text>
              )}
            </div>
          </Tooltip>
          <Tooltip content="Orders waiting to be fulfilled">
            <div className="flex flex-col cursor-help hover:bg-ui-bg-subtle p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-1">
                <Text className="text-ui-fg-subtle text-sm">Pending Orders</Text>
                <QuestionMarkCircle className="w-3.5 h-3.5 text-ui-fg-muted" />
              </div>
              <Text className="text-2xl font-semibold">{stats?.pending_orders ?? 0}</Text>
              {(stats?.pending_orders ?? 0) === 0 && (
                <Text className="text-xs text-ui-fg-muted">Orders will appear here</Text>
              )}
            </div>
          </Tooltip>
        </div>
      </Container>

      {/* Tips for Success - Dismissible */}
      {showTips && stepsCompleted < totalSteps && (
        <Container className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">💡 Tips for Success</Heading>
            <Button 
              variant="transparent" 
              size="small"
              onClick={() => setShowTips(false)}
            >
              Dismiss
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {FARM_TIPS.map((tip, index) => (
              <div 
                key={index}
                className="bg-ui-bg-subtle p-4 rounded-lg hover:bg-ui-bg-subtle-hover transition-colors"
              >
                <Text className="text-2xl mb-2">{tip.icon}</Text>
                <Text className="font-medium mb-1">{tip.title}</Text>
                <Text className="text-ui-fg-subtle text-sm">{tip.description}</Text>
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* Practices */}
      {profile.practices && profile.practices.length > 0 && (
        <Container className="p-6">
          <Heading level="h3" className="mb-3">Growing Practices</Heading>
          <div className="flex flex-wrap gap-2">
            {profile.practices.map((practice: GrowingPractice) => (
              <Badge key={practice} color="grey">
                {GrowingPracticeLabels[practice] || practice}
              </Badge>
            ))}
          </div>
        </Container>
      )}

      {/* Quick Actions */}
      <Container className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Quick Actions</Heading>
          <Tooltip content="Common tasks to manage your farm">
            <QuestionMarkCircle className="w-4 h-4 text-ui-fg-muted cursor-help" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="secondary"
            className="flex flex-col items-center justify-center gap-2 h-24 hover:border-green-300 hover:bg-green-50 transition-colors"
            onClick={() => navigate("/farm/harvests/create")}
          >
            <Sun className="w-6 h-6 text-green-600" />
            <span>Log New Harvest</span>
          </Button>
          <Button
            variant="secondary"
            className="flex flex-col items-center justify-center gap-2 h-24 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            onClick={() => navigate("/farm/availability/create")}
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Create Availability</span>
          </Button>
          <Button
            variant="secondary"
            className="flex flex-col items-center justify-center gap-2 h-24 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            onClick={() => navigate("/farm/harvests")}
          >
            <ArrowPath className="w-6 h-6 text-purple-600" />
            <span>Manage Harvests</span>
          </Button>
        </div>
      </Container>

      {/* Story */}
      {profile.story && (
        <Container className="p-6">
          <Heading level="h3" className="mb-3">Our Story</Heading>
          <Text className="text-ui-fg-subtle whitespace-pre-wrap">
            {profile.story}
          </Text>
        </Container>
      )}

      <Outlet />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Farm",
  icon: Sun,
})

export default FarmDashboardPage

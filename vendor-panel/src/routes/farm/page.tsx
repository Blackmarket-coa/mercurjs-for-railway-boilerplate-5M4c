import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, Calendar, Map, Sun } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Outlet, useNavigate } from "react-router-dom"
import { sdk } from "../../lib/sdk"
import { ProducerDTO, GrowingPracticeLabels, GrowingPractice } from "../../types/domain"

interface FarmDashboardStats {
  active_harvests: number
  total_lots: number
  available_products: number
  pending_orders: number
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

  const isLoading = profileLoading || statsLoading

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
            <Sun className="w-12 h-12 text-ui-fg-muted" />
            <Heading level="h2">Welcome to Farm Manager</Heading>
            <Text className="text-ui-fg-subtle text-center max-w-md">
              Set up your farm profile to start tracking harvests, managing lots, 
              and making your products available to customers.
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate("/farm/profile/create")}
            >
              Create Farm Profile
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            {profile.photo && (
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
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
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Active Harvests</Text>
            <Text className="text-2xl font-semibold">{stats?.active_harvests ?? 0}</Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Total Lots</Text>
            <Text className="text-2xl font-semibold">{stats?.total_lots ?? 0}</Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Available Products</Text>
            <Text className="text-2xl font-semibold">{stats?.available_products ?? 0}</Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Pending Orders</Text>
            <Text className="text-2xl font-semibold">{stats?.pending_orders ?? 0}</Text>
          </div>
        </div>
      </Container>

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
        <Heading level="h3" className="mb-4">Quick Actions</Heading>
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="secondary"
            className="flex items-center justify-center gap-2"
            onClick={() => navigate("/farm/harvests/create")}
          >
            <Sun className="w-4 h-4" />
            Log New Harvest
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center gap-2"
            onClick={() => navigate("/farm/availability/create")}
          >
            <Calendar className="w-4 h-4" />
            Create Availability Window
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center gap-2"
            onClick={() => navigate("/farm/harvests")}
          >
            <ArrowPath className="w-4 h-4" />
            Manage Harvests
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

import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Container, Heading, Button, Text, Badge, Tabs } from "@medusajs/ui"
import { Plus, Heart, CalendarMini, Users } from "@medusajs/icons"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useVendorType } from "../../../providers/vendor-type-provider"

/**
 * VolunteersList - Volunteer management for gardens and mutual aid
 *
 * This page allows vendors to manage their volunteers,
 * including a list of volunteers and their schedules.
 */
export function VolunteersList() {
  const navigate = useNavigate()
  const { vendorType } = useVendorType()
  const [activeTab, setActiveTab] = useState("list")

  // Adjust terminology based on vendor type
  const terminology = vendorType === "mutual_aid"
    ? { title: "Community Helpers", singular: "helper" }
    : { title: "Volunteers", singular: "volunteer" }

  return (
    <SingleColumnPage>
      <Container className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Heading level="h1" className="text-2xl font-serif text-warm-900">
              {terminology.title}
            </Heading>
            <Text className="text-warm-600 mt-1">
              Manage your {terminology.title.toLowerCase()} and their schedules
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/volunteers/invite")}
          >
            <Plus className="mr-2" />
            Invite {terminology.singular}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="list">
              <Users className="w-4 h-4 mr-2" />
              {terminology.title} List
            </Tabs.Trigger>
            <Tabs.Trigger value="schedule">
              <CalendarMini className="w-4 h-4 mr-2" />
              Schedule
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="list" className="mt-6">
            <VolunteersListPlaceholder terminology={terminology} />
          </Tabs.Content>

          <Tabs.Content value="schedule" className="mt-6">
            <VolunteerSchedulePlaceholder terminology={terminology} />
          </Tabs.Content>
        </Tabs>
      </Container>
      <Outlet />
    </SingleColumnPage>
  )
}

function VolunteersListPlaceholder({ terminology }: { terminology: { title: string; singular: string } }) {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-rose-500" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No {terminology.title} Yet
        </Heading>
        <Text className="text-warm-600 mb-6">
          Start building your community by inviting {terminology.title.toLowerCase()}.
          They can sign up for shifts, track their hours, and help with your operations.
        </Text>
        <Button variant="primary">
          <Plus className="mr-2" />
          Invite Your First {terminology.singular}
        </Button>
      </div>
    </div>
  )
}

function VolunteerSchedulePlaceholder({ terminology }: { terminology: { title: string; singular: string } }) {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarMini className="w-8 h-8 text-blue-500" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          Schedule Not Set Up
        </Heading>
        <Text className="text-warm-600 mb-6">
          Create shifts and schedules for your {terminology.title.toLowerCase()}.
          They'll be able to sign up for available time slots.
        </Text>
        <Button variant="primary">
          <Plus className="mr-2" />
          Create First Shift
        </Button>
      </div>
    </div>
  )
}

export const Component = VolunteersList

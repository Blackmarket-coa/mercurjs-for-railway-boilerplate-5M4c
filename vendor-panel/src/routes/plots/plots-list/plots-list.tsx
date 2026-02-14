import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Container, Heading, Button, Text, Badge, Tabs } from "@medusajs/ui"
import { Plus, SquaresPlus } from "@medusajs/icons"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"

/**
 * PlotsList - Community garden plot management
 *
 * This page allows garden vendors to manage their plots,
 * including available plots and assignments.
 */
export function PlotsList() {
  const navigate = useNavigate()
  const { getWidgets } = useDashboardExtension()
  const [activeTab, setActiveTab] = useState("available")

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("plot.list.before"),
        after: getWidgets("plot.list.after"),
      }}
    >
      <Container className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Heading level="h1" className="text-2xl font-serif text-warm-900">
              Garden Plots
            </Heading>
            <Text className="text-warm-600 mt-1">
              Manage your community garden plots and member assignments
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/plots")}
          >
            <Plus className="mr-2" />
            Add Plot
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="available">
              Available Plots
            </Tabs.Trigger>
            <Tabs.Trigger value="assignments">
              Assignments
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="available" className="mt-6">
            <AvailablePlotsPlaceholder />
          </Tabs.Content>

          <Tabs.Content value="assignments" className="mt-6">
            <PlotAssignmentsPlaceholder />
          </Tabs.Content>
        </Tabs>
      </Container>
      <Outlet />
    </SingleColumnPage>
  )
}

function AvailablePlotsPlaceholder() {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SquaresPlus className="w-8 h-8 text-green-600" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No Plots Configured
        </Heading>
        <Text className="text-warm-600 mb-6">
          Define your garden plots to start accepting plot reservations from community members.
          You can set plot sizes, locations, and availability.
        </Text>
        <Button variant="primary">
          <Plus className="mr-2" />
          Create Your First Plot
        </Button>
      </div>
    </div>
  )
}

function PlotAssignmentsPlaceholder() {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <SquaresPlus className="w-8 h-8 text-warm-500" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No Assignments Yet
        </Heading>
        <Text className="text-warm-600 mb-6">
          When community members reserve plots, their assignments will appear here.
          You can manage renewals, transfers, and plot status.
        </Text>
      </div>
    </div>
  )
}

export const Component = PlotsList

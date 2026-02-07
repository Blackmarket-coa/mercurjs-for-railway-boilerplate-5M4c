import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Container, Heading, Button, Text, Badge, Tabs } from "@medusajs/ui"
import { Plus, Gift, CurrencyDollar } from "@medusajs/icons"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useVendorType } from "../../../providers/vendor-type-provider"

/**
 * DonationsList - Donation management for gardens, kitchens, and mutual aid
 *
 * This page allows vendors to manage their donations,
 * including monetary and in-kind donations.
 */
export function DonationsList() {
  const navigate = useNavigate()
  const { vendorType } = useVendorType()
  const { getWidgets } = useDashboardExtension()
  const [activeTab, setActiveTab] = useState("received")

  // Adjust terminology based on vendor type
  const getTerminology = () => {
    switch (vendorType) {
      case "mutual_aid":
        return {
          title: "Community Donations",
          description: "Track donations received and distributed to community members",
        }
      case "kitchen":
        return {
          title: "Kitchen Donations",
          description: "Manage food and supply donations for your community kitchen",
        }
      default:
        return {
          title: "Garden Donations",
          description: "Track harvest donations and community contributions",
        }
    }
  }

  const terminology = getTerminology()

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("donation.list.before"),
        after: getWidgets("donation.list.after"),
      }}
    >
      <Container className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Heading level="h1" className="text-2xl font-serif text-warm-900">
              {terminology.title}
            </Heading>
            <Text className="text-warm-600 mt-1">
              {terminology.description}
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/donations/record")}
          >
            <Plus className="mr-2" />
            Record Donation
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <SummaryCard
            label="This Month"
            value="$0.00"
            icon={<CurrencyDollar className="w-5 h-5" />}
            color="green"
          />
          <SummaryCard
            label="In-Kind Items"
            value="0"
            icon={<Gift className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            label="Donors"
            value="0"
            icon={<Gift className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="received">
              Received
            </Tabs.Trigger>
            <Tabs.Trigger value="distributed">
              Distributed
            </Tabs.Trigger>
            <Tabs.Trigger value="donors">
              Donors
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="received" className="mt-6">
            <DonationsPlaceholder type="received" />
          </Tabs.Content>

          <Tabs.Content value="distributed" className="mt-6">
            <DonationsPlaceholder type="distributed" />
          </Tabs.Content>

          <Tabs.Content value="donors" className="mt-6">
            <DonorsPlaceholder />
          </Tabs.Content>
        </Tabs>
      </Container>
      <Outlet />
    </SingleColumnPage>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: "green" | "blue" | "purple"
}) {
  const colorClasses = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  }

  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <Text className="text-sm font-medium">{label}</Text>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function DonationsPlaceholder({ type }: { type: "received" | "distributed" }) {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-amber-600" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No Donations {type === "received" ? "Recorded" : "Distributed"} Yet
        </Heading>
        <Text className="text-warm-600 mb-6">
          {type === "received"
            ? "Record donations as they come in to track your community support."
            : "Track how donations are distributed to community members."}
        </Text>
        <Button variant="primary">
          <Plus className="mr-2" />
          {type === "received" ? "Record Donation" : "Log Distribution"}
        </Button>
      </div>
    </div>
  )
}

function DonorsPlaceholder() {
  return (
    <div className="bg-warm-50 rounded-xl p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-purple-500" />
        </div>
        <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
          No Donors Yet
        </Heading>
        <Text className="text-warm-600 mb-6">
          Donors who contribute to your organization will appear here.
          You can send thank you notes and track their giving history.
        </Text>
      </div>
    </div>
  )
}

export const Component = DonationsList

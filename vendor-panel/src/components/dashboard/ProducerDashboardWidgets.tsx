import React from "react"
import {
  CurrencyDollar,
  ChartBar,
  Users,
  ArrowUpRightMini,
  ArrowDownRightMini,
  Calendar,
  ShoppingBag,
  ArrowPath,
} from "@medusajs/icons"
import { Badge, Heading, Text, clx } from "@medusajs/ui"

interface ProducerStats {
  totalRevenue: number
  totalPayout: number
  totalOrders: number
  totalCustomers: number
  repeatCustomers: number
  repeatCustomerPercent: number
  revenueStabilityScore: number
  subscriptionRevenuePercent: number
  fulfillmentReliability: number
  avgOrderValue: number
  monthsActive: number
  // Comparison to last period
  revenueChange?: number
  orderChange?: number
  customerChange?: number
}

interface GuaranteedRevenue {
  total: number
  breakdown: Array<{
    standingOrderId: string
    customerName?: string
    value: number
    frequency: string
  }>
}

interface ProducerDashboardWidgetsProps {
  stats: ProducerStats
  guaranteedRevenue?: GuaranteedRevenue
  period?: "weekly" | "monthly"
  currency?: string
}

/**
 * Producer Dashboard Widgets
 * 
 * "UI must answer: Will this be worth my time?"
 */
export const ProducerDashboardWidgets = ({
  stats,
  guaranteedRevenue,
  period = "monthly",
  currency = "USD",
}: ProducerDashboardWidgetsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payout */}
        <MetricCard
          title="Your Earnings"
          value={formatCurrency(stats.totalPayout)}
          subtitle="This month"
          change={stats.revenueChange}
          icon={<CurrencyDollar className="text-green-500" />}
          highlight
        />
        
        {/* Revenue Stability */}
        <MetricCard
          title="Revenue Stability"
          value={`${stats.revenueStabilityScore}%`}
          subtitle="Predictability score"
          icon={<ChartBar className="text-blue-500" />}
          badge={
            stats.revenueStabilityScore >= 70 ? (
              <Badge color="green">Stable</Badge>
            ) : stats.revenueStabilityScore >= 40 ? (
              <Badge color="orange">Growing</Badge>
            ) : (
              <Badge color="grey">Building</Badge>
            )
          }
        />
        
        {/* Repeat Customers */}
        <MetricCard
          title="Repeat Customers"
          value={`${stats.repeatCustomerPercent.toFixed(0)}%`}
          subtitle={`${stats.repeatCustomers} of ${stats.totalCustomers} customers`}
          change={stats.customerChange}
          icon={<Users className="text-purple-500" />}
        />
        
        {/* Fulfillment Reliability */}
        <MetricCard
          title="Fulfillment Score"
          value={`${stats.fulfillmentReliability}%`}
          subtitle="On-time delivery rate"
          icon={<ShoppingBag className="text-amber-500" />}
          badge={
            stats.fulfillmentReliability >= 95 ? (
              <Badge color="green">Excellent</Badge>
            ) : stats.fulfillmentReliability >= 80 ? (
              <Badge color="orange">Good</Badge>
            ) : (
              <Badge color="red">Needs Work</Badge>
            )
          }
        />
      </div>

      {/* Guaranteed Revenue Section */}
      {guaranteedRevenue && guaranteedRevenue.total > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowPath className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <Heading level="h3" className="text-green-800">
                  Guaranteed Revenue
                </Heading>
                <Text className="text-green-600 text-sm">
                  From standing orders & subscriptions
                </Text>
              </div>
            </div>
            <div className="text-right">
              <Text className="text-3xl font-bold text-green-700">
                {formatCurrency(guaranteedRevenue.total)}
              </Text>
              <Text className="text-sm text-green-600">
                per {period === "monthly" ? "month" : "week"}
              </Text>
            </div>
          </div>
          
          {guaranteedRevenue.breakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <Text className="text-sm font-medium text-green-800 mb-2">
                Active Standing Orders ({guaranteedRevenue.breakdown.length})
              </Text>
              <div className="space-y-2">
                {guaranteedRevenue.breakdown.slice(0, 5).map((order, idx) => (
                  <div 
                    key={order.standingOrderId} 
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-green-700">
                      {order.customerName || `Customer ${idx + 1}`}
                    </span>
                    <span className="text-green-800 font-medium">
                      {formatCurrency(order.value)} / {order.frequency.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources */}
        <div className="bg-white border rounded-lg p-6">
          <Heading level="h3" className="mb-4">Revenue Sources</Heading>
          <div className="space-y-4">
            <RevenueSourceBar
              label="Subscriptions & Standing Orders"
              percent={stats.subscriptionRevenuePercent}
              color="bg-green-500"
            />
            <RevenueSourceBar
              label="Repeat Customers"
              percent={stats.repeatCustomerPercent}
              color="bg-blue-500"
            />
            <RevenueSourceBar
              label="New Customers"
              percent={100 - stats.repeatCustomerPercent}
              color="bg-purple-500"
            />
          </div>
          <Text className="text-sm text-gray-500 mt-4">
            Higher subscription % = more predictable income
          </Text>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white border rounded-lg p-6">
          <Heading level="h3" className="mb-4">Quick Stats</Heading>
          <div className="space-y-4">
            <StatRow
              label="Average Order Value"
              value={formatCurrency(stats.avgOrderValue)}
            />
            <StatRow
              label="Total Orders"
              value={stats.totalOrders.toString()}
            />
            <StatRow
              label="Total Customers"
              value={stats.totalCustomers.toString()}
            />
            <StatRow
              label="Months Active"
              value={stats.monthsActive.toString()}
            />
          </div>
        </div>
      </div>

      {/* Earnings Statement */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">This Month's Earnings</Heading>
          <Text className="text-sm text-gray-500">
            <Calendar className="inline-block w-4 h-4 mr-1" />
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </Text>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gray-50">
            <Text className="font-medium">Gross Revenue</Text>
            <Text className="font-semibold">{formatCurrency(stats.totalRevenue)}</Text>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <Text className="text-gray-600">Platform Fee</Text>
            <Text className="text-gray-600">
              -{formatCurrency(stats.totalRevenue - stats.totalPayout)}
            </Text>
          </div>
          <div className="flex items-center justify-between p-4 border-t bg-green-50">
            <Text className="font-semibold text-green-800">Your Payout</Text>
            <Text className="font-bold text-green-700 text-xl">
              {formatCurrency(stats.totalPayout)}
            </Text>
          </div>
        </div>
        
        <Text className="text-sm text-gray-500 mt-3">
          This amount will be deposited to your account according to your payout schedule.
        </Text>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  icon: React.ReactNode
  badge?: React.ReactNode
  highlight?: boolean
}

const MetricCard = ({
  title,
  value,
  subtitle,
  change,
  icon,
  badge,
  highlight,
}: MetricCardProps) => (
  <div
    className={clx(
      "rounded-lg border p-4",
      highlight ? "bg-green-50 border-green-200" : "bg-white"
    )}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      {badge}
    </div>
    <Text className="text-sm text-gray-500">{title}</Text>
    <div className="flex items-baseline gap-2 mt-1">
      <Text className={clx("text-2xl font-bold", highlight ? "text-green-700" : "text-gray-900")}>
        {value}
      </Text>
      {change !== undefined && (
        <span
          className={clx(
            "flex items-center text-sm",
            change >= 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {change >= 0 ? (
            <ArrowUpRightMini className="w-4 h-4" />
          ) : (
            <ArrowDownRightMini className="w-4 h-4" />
          )}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    {subtitle && <Text className="text-xs text-gray-400 mt-1">{subtitle}</Text>}
  </div>
)

interface RevenueSourceBarProps {
  label: string
  percent: number
  color: string
}

const RevenueSourceBar = ({ label, percent, color }: RevenueSourceBarProps) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <Text className="text-sm text-gray-700">{label}</Text>
      <Text className="text-sm font-medium">{percent.toFixed(0)}%</Text>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={clx("h-full rounded-full transition-all", color)}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
)

interface StatRowProps {
  label: string
  value: string
}

const StatRow = ({ label, value }: StatRowProps) => (
  <div className="flex items-center justify-between">
    <Text className="text-gray-600">{label}</Text>
    <Text className="font-semibold">{value}</Text>
  </div>
)

export default ProducerDashboardWidgets

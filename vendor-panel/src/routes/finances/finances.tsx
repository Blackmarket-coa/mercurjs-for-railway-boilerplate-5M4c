import {
  Container,
  Heading,
  Text,
} from "@medusajs/ui"

// Main Finances Page - Simplified for debugging
export const FinancesPage = () => {
  return (
    <Container className="p-8">
      <div className="mb-8">
        <Heading level="h1" className="text-2xl font-bold mb-2">
          💰 Financial Dashboard
        </Heading>
        <Text className="text-ui-fg-muted">
          Manage your earnings, payouts, and cash advances
        </Text>
      </div>

      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6">
        <Text>Financial features coming soon...</Text>
        <Text className="text-ui-fg-muted mt-2">
          This page is being set up. Check back soon for your financial dashboard.
        </Text>
      </div>
    </Container>
  )
}

export default FinancesPage

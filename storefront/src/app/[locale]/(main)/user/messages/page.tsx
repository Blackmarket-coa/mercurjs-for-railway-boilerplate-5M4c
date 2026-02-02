import { AccountLoadingState, LoginForm, UserNavigation } from "@/components/molecules"
import { UserMessagesSection } from "@/components/sections/UserMessagesSection/UserMessagesSection"
import { retrieveCustomerContext } from "@/lib/data/customer"

export default async function MessagesPage() {
  const { customer, isAuthenticated } = await retrieveCustomerContext()

  if (!customer) {
    if (!isAuthenticated) return <LoginForm />
    return <AccountLoadingState title="Messages" />
  }

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <UserMessagesSection />
        </div>
      </div>
    </main>
  )
}

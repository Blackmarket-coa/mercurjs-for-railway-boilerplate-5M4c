import type { Metadata } from "next"
import { AccountLoadingState, UserNavigation } from "@/components/molecules"
import { retrieveCustomerContext } from "@/lib/data/customer"
import { redirect } from "next/navigation"
import { Addresses } from "@/components/organisms"
import { listRegions } from "@/lib/data/regions"


export const metadata: Metadata = {
  title: "Your Addresses",
  description: "Manage your saved shipping and billing addresses.",
}

export default async function Page() {
  const { customer, isAuthenticated } = await retrieveCustomerContext()
  const regions = await listRegions()

  if (!customer) {
    if (!isAuthenticated) {
      redirect("/user")
    }
    return <AccountLoadingState title="Addresses" />
  }

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <Addresses {...{ user: customer, regions }} />
      </div>
    </main>
  )
}

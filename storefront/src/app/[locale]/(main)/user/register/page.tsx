import { AccountLoadingState, RegisterForm } from "@/components/molecules"
import { retrieveCustomerContext } from "@/lib/data/customer"
import { redirect } from "next/navigation"

export default async function Page() {
  const { customer, isAuthenticated } = await retrieveCustomerContext()

  if (customer) {
    redirect("/user")
  }

  if (isAuthenticated) {
    return <AccountLoadingState title="Account" />
  }

  return <RegisterForm />
}

import { UserNavigation } from "@/components/molecules"

type AccountLoadingStateProps = {
  title?: string
  description?: string
}

export const AccountLoadingState = ({
  title = "Account",
  description = "We’re refreshing your session. Please try again in a moment.",
}: AccountLoadingStateProps) => {
  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-4">
          <h1 className="heading-md uppercase">{title}</h1>
          <p className="text-secondary">{description}</p>
        </div>
      </div>
    </main>
  )
}

import { Spinner } from "@medusajs/icons"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useMe, useRegistrationStatus } from "../../../hooks/api/users"
import { SearchProvider } from "../../../providers/search-provider"
import { SidebarProvider } from "../../../providers/sidebar-provider"
import { RocketChatProvider } from "../../../providers/rocketchat-provider"
import { getAuthToken } from "../../../lib/client"

export const ProtectedRoute = () => {
  const location = useLocation()
  const hasToken = Boolean(getAuthToken())

  // First, check registration status to determine the appropriate redirect
  // This check runs before useMe to prevent the auth loop
  const {
    registrationStatus,
    isPending: isStatusPending
  } = useRegistrationStatus({
    // Only run this query if we have a token
    enabled: hasToken,
  })

  // Only fetch seller data if registration status indicates approval
  const hasSellerId = Boolean(registrationStatus?.seller_id)
  const isApproved = registrationStatus?.status === "approved" && hasSellerId
  const { seller, isPending: isSellerPending, error } = useMe({
    // Only run useMe if we know the user is approved
    enabled: isApproved,
  })

  // If no token, redirect to login immediately
  if (!hasToken) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Show loading while checking registration status
  if (isStatusPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    )
  }

  // Handle different registration statuses
  if (registrationStatus) {
    switch (registrationStatus.status) {
      case "pending":
      case "rejected":
      case "cancelled":
      case "no_request":
        // Redirect to pending-approval page for non-approved states
        return <Navigate to="/pending-approval" replace />

      case "unauthenticated":
        // Token is invalid or expired
        return (
          <Navigate
            to="/login"
            state={{ from: location }}
            replace
          />
        )

      case "approved":
        if (!hasSellerId) {
          return <Navigate to="/pending-approval" replace />
        }
        // Continue to load seller data below when seller_id is available
        break

      default:
        // Unknown status - show pending page with error info
        return <Navigate to="/pending-approval" replace />
    }
  }

  // If approved, show loading while fetching seller data
  if (isSellerPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-ui-fg-interactive animate-spin" />
      </div>
    )
  }

  // If we have an error or no seller after approval status, redirect to login
  // This handles edge cases where approval succeeded but seller fetch fails
  if (!seller) {
    return (
      <Navigate
        to={`/login${error?.message ? `?reason=${error.message}` : ""}`}
        state={{ from: location }}
        replace
      />
    )
  }

  // User is approved and seller data is loaded - render the protected content
  return (
    <RocketChatProvider>
      <SidebarProvider>
        <SearchProvider>
          <Outlet />
        </SearchProvider>
      </SidebarProvider>
    </RocketChatProvider>
  )
}

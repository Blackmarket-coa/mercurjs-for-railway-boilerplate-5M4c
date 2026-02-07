import { authenticate, defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Authenticated routes - require customer login for write operations
    {
      matcher: "/store/collective/demand-pools",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/demand-pools/:id",
      method: "PATCH",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/demand-pools/:id/join",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/demand-pools/:id/bounties",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/demand-pools/:id/proposals/*/vote",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/demand-pools/:id/escrow",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/bargaining-groups",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/bargaining-groups/:id",
      method: "PATCH",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/bargaining-groups/:id/join",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/bargaining-groups/:id/proposals",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/bargaining-groups/:id/proposals/*/vote",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/bargaining-groups/:id/threads",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/buyer-networks",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/collective/buyer-networks/:id/join",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
  ],
})

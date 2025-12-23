import { DashboardExtensionManager } from "./extensions"
import { Providers } from "./providers/providers"
import { RouterProvider } from "./providers/router-provider"

import displayModule from "virtual:medusa/displays"
import formModule from "virtual:medusa/forms"
import menuItemModule from "virtual:medusa/menu-items"
import widgetModule from "virtual:medusa/widgets"

import DigitalProducts from "./routes/products/digital/digital-products"
import TicketBookings from "./routes/products/tickets/ticket-bookings"

import "./index.css"

function App() {
  const manager = new DashboardExtensionManager({
    displayModule,
    formModule,
    menuItemModule,
    widgetModule,
  })

  // Register sidebar items
  menuItemModule.register({
    id: "digital-products",
    label: "Digital Products",
    route: "/products/digital",
    active: true,
  })

  menuItemModule.register({
    id: "ticket-bookings",
    label: "Ticket Bookings",
    route: "/products/tickets",
    active: true,
  })

  // Register page components
  manager.registerPage({
    id: "digital-products",
    component: DigitalProducts,
    route: "/products/digital",
  })

  manager.registerPage({
    id: "ticket-bookings",
    component: TicketBookings,
    route: "/products/tickets",
  })

  return (
    <Providers api={manager.api}>
      <RouterProvider />
    </Providers>
  )
}

export default App

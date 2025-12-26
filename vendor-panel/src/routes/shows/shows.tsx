import { Container, Heading, Text, Table, Badge } from "@medusajs/ui"
import { ReceiptPercent } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { Link } from "react-router-dom"

interface TicketProduct {
  id: string
  product_id: string
  venue_id: string
  dates: string[]
  venue: {
    id: string
    name: string
  }
  product: {
    id: string
    title: string
  }
  created_at: string
}

export const Shows = () => {
  const { data, isLoading } = useQuery<{ ticket_products: TicketProduct[]; count: number }>({
    queryKey: ["ticket-products"],
    queryFn: () => sdk.client.fetch("/admin/ticket-products"),
  })

  const shows = data?.ticket_products || []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <ReceiptPercent className="text-ui-fg-subtle" />
          <div>
            <Heading>Shows</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Manage your ticketed events and shows
            </Text>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        {isLoading ? (
          <Text>Loading shows...</Text>
        ) : shows.length === 0 ? (
          <div className="text-center py-8">
            <ReceiptPercent className="mx-auto h-12 w-12 text-ui-fg-subtle mb-4" />
            <Heading level="h3">No shows yet</Heading>
            <Text className="text-ui-fg-subtle">
              Create your first show to start selling tickets
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Venue</Table.HeaderCell>
                <Table.HeaderCell>Dates</Table.HeaderCell>
                <Table.HeaderCell>Product</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {shows.map((show) => (
                <Table.Row key={show.id}>
                  <Table.Cell className="font-medium">
                    {show.product?.title || "Untitled"}
                  </Table.Cell>
                  <Table.Cell>{show.venue?.name || "-"}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1 flex-wrap">
                      {show.dates.slice(0, 2).map((date) => (
                        <Badge key={date} color="blue" size="small">
                          {new Date(date).toLocaleDateString()}
                        </Badge>
                      ))}
                      {show.dates.length > 2 && (
                        <Badge color="grey" size="small">
                          +{show.dates.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Link 
                      to={`/products/${show.product_id}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      View Product
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

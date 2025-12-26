import { Container, Heading, Text, Table, Badge } from "@medusajs/ui"
import { Buildings } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

interface Venue {
  id: string
  name: string
  address?: string
  rows: Array<{
    id: string
    row_number: string
    row_type: string
    seat_count: number
  }>
  created_at: string
}

export const Venues = () => {
  const { data, isLoading } = useQuery<{ venues: Venue[]; count: number }>({
    queryKey: ["venues"],
    queryFn: () => sdk.client.fetch("/admin/venues"),
  })

  const venues = data?.venues || []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Buildings className="text-ui-fg-subtle" />
          <div>
            <Heading>Venues</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Manage your event venues and seating configurations
            </Text>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        {isLoading ? (
          <Text>Loading venues...</Text>
        ) : venues.length === 0 ? (
          <div className="text-center py-8">
            <Buildings className="mx-auto h-12 w-12 text-ui-fg-subtle mb-4" />
            <Heading level="h3">No venues yet</Heading>
            <Text className="text-ui-fg-subtle">
              Create your first venue to start selling tickets
            </Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Address</Table.HeaderCell>
                <Table.HeaderCell>Capacity</Table.HeaderCell>
                <Table.HeaderCell>Rows</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {venues.map((venue) => (
                <Table.Row key={venue.id}>
                  <Table.Cell className="font-medium">{venue.name}</Table.Cell>
                  <Table.Cell>{venue.address || "-"}</Table.Cell>
                  <Table.Cell>
                    {venue.rows.reduce((sum, row) => sum + row.seat_count, 0)} seats
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1 flex-wrap">
                      {[...new Set(venue.rows.map((r) => r.row_type))].map((type) => (
                        <Badge key={type} color="grey" size="small">
                          {type}
                        </Badge>
                      ))}
                    </div>
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

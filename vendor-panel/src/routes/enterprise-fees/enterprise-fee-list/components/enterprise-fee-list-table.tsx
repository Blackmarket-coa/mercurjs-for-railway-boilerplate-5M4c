import { useState } from "react"
import {
  Container,
  Heading,
  Text,
  Table,
  Button,
  Badge,
  toast,
  usePrompt,
  IconButton,
} from "@medusajs/ui"
import { PlusMini, Trash, PencilSquare } from "@medusajs/icons"
import {
  useEnterpriseFees,
  useDeleteEnterpriseFee,
  EnterpriseFee,
} from "../../../../hooks/api/enterprise-fees"
import { CreateEnterpriseFeeModal } from "./create-enterprise-fee-modal"
import { EditEnterpriseFeeModal } from "./edit-enterprise-fee-modal"

const FEE_TYPE_LABELS: Record<string, string> = {
  admin: "Admin",
  packing: "Packing",
  transport: "Transport",
  fundraising: "Fundraising",
  sales: "Sales",
  coordinator: "Coordinator",
}

const CALCULATOR_TYPE_LABELS: Record<string, string> = {
  flat_rate: "Flat Rate",
  flat_per_item: "Per Item",
  percentage: "Percentage",
  weight: "By Weight",
}

export const EnterpriseFeeListTable = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFee, setEditingFee] = useState<EnterpriseFee | null>(null)
  const { data, isLoading } = useEnterpriseFees()
  const deleteFee = useDeleteEnterpriseFee()
  const prompt = usePrompt()

  const handleDelete = async (fee: EnterpriseFee) => {
    const confirmed = await prompt({
      title: "Delete Fee Template",
      description: `Are you sure you want to delete "${fee.name}"? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await deleteFee.mutateAsync(fee.id)
        toast.success("Fee template deleted")
      } catch (err) {
        toast.error("Failed to delete fee template")
      }
    }
  }

  const formatAmount = (fee: EnterpriseFee) => {
    if (fee.calculator_type === "percentage") {
      return `${(fee.amount / 100).toFixed(2)}%`
    }
    if (fee.calculator_type === "weight") {
      return `$${(fee.amount / 100).toFixed(2)}/kg`
    }
    return `$${(fee.amount / 100).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <Text className="text-ui-fg-subtle">Loading...</Text>
      </Container>
    )
  }

  const fees = data?.enterprise_fees || []

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Enterprise Fees</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Create fee templates to apply to order cycles
            </Text>
          </div>
          <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
            <PlusMini />
            Create Fee
          </Button>
        </div>

        {fees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Text className="text-ui-fg-subtle">
              No fee templates created yet
            </Text>
            <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
              Create your first fee template
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Calculator</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="w-[1%]"></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {fees.map((fee) => (
                <Table.Row key={fee.id}>
                  <Table.Cell>
                    <div>
                      <Text weight="plus">{fee.name}</Text>
                      {fee.description && (
                        <Text size="small" className="text-ui-fg-subtle">
                          {fee.description}
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="blue" size="small">
                      {FEE_TYPE_LABELS[fee.fee_type] || fee.fee_type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{CALCULATOR_TYPE_LABELS[fee.calculator_type] || fee.calculator_type}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text weight="plus">{formatAmount(fee)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={fee.is_active ? "green" : "grey"} size="small">
                      {fee.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <IconButton
                        variant="transparent"
                        onClick={() => setEditingFee(fee)}
                      >
                        <PencilSquare />
                      </IconButton>
                      <IconButton
                        variant="transparent"
                        onClick={() => handleDelete(fee)}
                      >
                        <Trash className="text-ui-fg-error" />
                      </IconButton>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <CreateEnterpriseFeeModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingFee && (
        <EditEnterpriseFeeModal
          fee={editingFee}
          open={!!editingFee}
          onClose={() => setEditingFee(null)}
        />
      )}
    </>
  )
}

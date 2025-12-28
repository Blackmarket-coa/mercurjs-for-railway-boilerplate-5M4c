import { useState } from "react"
import {
  FocusModal,
  Button,
  Heading,
  Text,
  Input,
  Label,
  Select,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCreateEnterpriseFee } from "../../../../hooks/api/enterprise-fees"

interface CreateEnterpriseFeeModalProps {
  open: boolean
  onClose: () => void
}

const FEE_TYPES = [
  { value: "admin", label: "Admin Fee" },
  { value: "packing", label: "Packing Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "fundraising", label: "Fundraising Fee" },
  { value: "sales", label: "Sales Fee" },
  { value: "coordinator", label: "Coordinator Fee" },
]

const CALCULATOR_TYPES = [
  { value: "flat_rate", label: "Flat Rate (per order)" },
  { value: "flat_per_item", label: "Flat Per Item" },
  { value: "percentage", label: "Percentage of Order" },
  { value: "weight", label: "By Weight (per kg)" },
]

export const CreateEnterpriseFeeModal = ({
  open,
  onClose,
}: CreateEnterpriseFeeModalProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [feeType, setFeeType] = useState("coordinator")
  const [calculatorType, setCalculatorType] = useState("percentage")
  const [amount, setAmount] = useState("")

  const createFee = useCreateEnterpriseFee()

  const resetForm = () => {
    setName("")
    setDescription("")
    setFeeType("coordinator")
    setCalculatorType("percentage")
    setAmount("")
  }

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please enter a name")
      return
    }
    if (!amount) {
      toast.error("Please enter an amount")
      return
    }

    // Convert amount based on calculator type
    let amountValue = parseFloat(amount)
    if (calculatorType === "percentage") {
      // Convert percentage to basis points (e.g., 5% = 500)
      amountValue = Math.round(amountValue * 100)
    } else {
      // Convert dollars to cents
      amountValue = Math.round(amountValue * 100)
    }

    try {
      await createFee.mutateAsync({
        name,
        description: description || undefined,
        fee_type: feeType as any,
        calculator_type: calculatorType as any,
        amount: amountValue,
      })
      toast.success("Fee template created")
      resetForm()
      onClose()
    } catch (err) {
      toast.error("Failed to create fee template")
    }
  }

  return (
    <FocusModal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createFee.isPending}>
            Create Fee
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div>
              <Heading>Create Fee Template</Heading>
              <Text className="text-ui-fg-subtle">
                Create a reusable fee that can be applied to order cycles
              </Text>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Coordinator Fee, Delivery Fee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description of this fee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>Fee Type</Label>
                <Select value={feeType} onValueChange={setFeeType}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {FEE_TYPES.map((type) => (
                      <Select.Item key={type.value} value={type.value}>
                        {type.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>Calculator Type</Label>
                <Select value={calculatorType} onValueChange={setCalculatorType}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {CALCULATOR_TYPES.map((type) => (
                      <Select.Item key={type.value} value={type.value}>
                        {type.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="amount">
                  Amount {calculatorType === "percentage" ? "(%)" : "($)"}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step={calculatorType === "percentage" ? "0.1" : "0.01"}
                  placeholder={calculatorType === "percentage" ? "e.g., 5" : "e.g., 2.50"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Text size="small" className="text-ui-fg-subtle">
                  {calculatorType === "percentage"
                    ? "Enter percentage (e.g., 5 for 5%)"
                    : calculatorType === "weight"
                    ? "Enter amount per kg"
                    : calculatorType === "flat_per_item"
                    ? "Enter amount per item"
                    : "Enter flat amount per order"}
                </Text>
              </div>
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

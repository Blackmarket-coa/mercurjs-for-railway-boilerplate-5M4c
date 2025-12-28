import { useState, useEffect } from "react"
import {
  FocusModal,
  Button,
  Heading,
  Text,
  Input,
  Label,
  Select,
  Textarea,
  Switch,
  toast,
} from "@medusajs/ui"
import {
  EnterpriseFee,
  useUpdateEnterpriseFee,
} from "../../../../hooks/api/enterprise-fees"

interface EditEnterpriseFeeModalProps {
  fee: EnterpriseFee
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

export const EditEnterpriseFeeModal = ({
  fee,
  open,
  onClose,
}: EditEnterpriseFeeModalProps) => {
  const [name, setName] = useState(fee.name)
  const [description, setDescription] = useState(fee.description || "")
  const [feeType, setFeeType] = useState(fee.fee_type)
  const [calculatorType, setCalculatorType] = useState(fee.calculator_type)
  const [amount, setAmount] = useState("")
  const [isActive, setIsActive] = useState(fee.is_active)

  const updateFee = useUpdateEnterpriseFee(fee.id)

  useEffect(() => {
    // Convert stored amount back to display format
    if (fee.calculator_type === "percentage") {
      setAmount((fee.amount / 100).toString())
    } else {
      setAmount((fee.amount / 100).toString())
    }
  }, [fee])

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
      amountValue = Math.round(amountValue * 100)
    } else {
      amountValue = Math.round(amountValue * 100)
    }

    try {
      await updateFee.mutateAsync({
        name,
        description: description || undefined,
        fee_type: feeType as any,
        calculator_type: calculatorType as any,
        amount: amountValue,
        is_active: isActive,
      })
      toast.success("Fee template updated")
      onClose()
    } catch (err) {
      toast.error("Failed to update fee template")
    }
  }

  return (
    <FocusModal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={updateFee.isPending}>
            Save Changes
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div>
              <Heading>Edit Fee Template</Heading>
              <Text className="text-ui-fg-subtle">
                Update this fee template
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
                <Select value={feeType} onValueChange={(v) => setFeeType(v as any)}>
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
                <Select value={calculatorType} onValueChange={(v) => setCalculatorType(v as any)}>
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
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <Text size="small" className="text-ui-fg-subtle">
                    Inactive fees cannot be applied to new order cycles
                  </Text>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

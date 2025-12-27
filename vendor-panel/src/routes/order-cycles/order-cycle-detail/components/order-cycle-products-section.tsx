import { useState } from "react"
import {
  Container,
  Heading,
  Text,
  Table,
  Button,
  Badge,
  Input,
  toast,
  usePrompt,
  IconButton,
  FocusModal,
  Label,
} from "@medusajs/ui"
import { PlusMini, Trash, MagnifyingGlass } from "@medusajs/icons"
import {
  OrderCycle,
  OrderCycleProduct,
  useAddOrderCycleProduct,
  useRemoveOrderCycleProduct,
} from "../../../../hooks/api/order-cycles"
import { useProducts } from "../../../../hooks/api/products"

interface OrderCycleProductsSectionProps {
  orderCycle: OrderCycle
}

export const OrderCycleProductsSection = ({
  orderCycle,
}: OrderCycleProductsSectionProps) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const removeProduct = useRemoveOrderCycleProduct(orderCycle.id)
  const prompt = usePrompt()

  const handleRemoveProduct = async (product: OrderCycleProduct) => {
    const confirmed = await prompt({
      title: "Remove Product",
      description: `Are you sure you want to remove this product from the order cycle?`,
      confirmText: "Remove",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await removeProduct.mutateAsync(product.id)
        toast.success("Product removed from order cycle")
      } catch (err) {
        toast.error("Failed to remove product")
      }
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return "-"
    return `$${(price / 100).toFixed(2)}`
  }

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Products</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Products available in this order cycle
            </Text>
          </div>
          <Button variant="secondary" onClick={() => setShowAddModal(true)}>
            <PlusMini />
            Add Product
          </Button>
        </div>

        {!orderCycle.products?.length ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Text className="text-ui-fg-subtle">
              No products added to this cycle yet
            </Text>
            <Button variant="secondary" onClick={() => setShowAddModal(true)}>
              Add your first product
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Product</Table.HeaderCell>
                <Table.HeaderCell>Variant</Table.HeaderCell>
                <Table.HeaderCell>Override Price</Table.HeaderCell>
                <Table.HeaderCell>Available</Table.HeaderCell>
                <Table.HeaderCell>Sold</Table.HeaderCell>
                <Table.HeaderCell className="w-[1%]"></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orderCycle.products.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-x-3">
                      {product.variant?.product?.thumbnail && (
                        <img
                          src={product.variant.product.thumbnail}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <Text weight="plus">
                        {product.variant?.product?.title || "Unknown Product"}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{product.variant?.title || product.variant_id}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{formatPrice(product.override_price)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>
                      {product.available_quantity !== undefined
                        ? product.available_quantity
                        : "Unlimited"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={product.sold_quantity > 0 ? "green" : "grey"}>
                      {product.sold_quantity}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <IconButton
                      variant="transparent"
                      onClick={() => handleRemoveProduct(product)}
                    >
                      <Trash className="text-ui-fg-error" />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      <AddProductModal
        orderCycleId={orderCycle.id}
        existingVariantIds={orderCycle.products?.map((p) => p.variant_id) || []}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  )
}

interface AddProductModalProps {
  orderCycleId: string
  existingVariantIds: string[]
  open: boolean
  onClose: () => void
}

const AddProductModal = ({
  orderCycleId,
  existingVariantIds,
  open,
  onClose,
}: AddProductModalProps) => {
  const [search, setSearch] = useState("")
  const [selectedVariant, setSelectedVariant] = useState<{
    id: string
    title: string
    product_title: string
  } | null>(null)
  const [overridePrice, setOverridePrice] = useState("")
  const [availableQuantity, setAvailableQuantity] = useState("")

  const addProduct = useAddOrderCycleProduct(orderCycleId)
  const { products, isLoading } = useProducts({
    q: search,
    limit: 20,
  })

  const handleSubmit = async () => {
    if (!selectedVariant) {
      toast.error("Please select a product variant")
      return
    }

    try {
      await addProduct.mutateAsync({
        variant_id: selectedVariant.id,
        override_price: overridePrice
          ? Math.round(parseFloat(overridePrice) * 100)
          : undefined,
        available_quantity: availableQuantity
          ? parseInt(availableQuantity)
          : undefined,
      })
      toast.success("Product added to order cycle")
      onClose()
      setSelectedVariant(null)
      setOverridePrice("")
      setAvailableQuantity("")
    } catch (err) {
      toast.error("Failed to add product")
    }
  }

  // Flatten products to variants
  const variants =
    products?.flatMap((product) =>
      (product.variants || [])
        .filter((v: any) => !existingVariantIds.includes(v.id))
        .map((v: any) => ({
          id: v.id,
          title: v.title,
          product_title: product.title,
          sku: v.sku,
        }))
    ) || []

  return (
    <FocusModal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={addProduct.isPending}>
            Add Product
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div>
              <Heading>Add Product to Order Cycle</Heading>
              <Text className="text-ui-fg-subtle">
                Select a product variant to add to this order cycle
              </Text>
            </div>

            <div className="flex flex-col gap-y-6">
              {!selectedVariant ? (
                <>
                  <div className="flex flex-col gap-y-2">
                    <Label>Search Products</Label>
                    <div className="relative">
                      <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-subtle" />
                      <Input
                        placeholder="Search by name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {isLoading ? (
                      <div className="p-4 text-center">
                        <Text className="text-ui-fg-subtle">Loading...</Text>
                      </div>
                    ) : variants.length === 0 ? (
                      <div className="p-4 text-center">
                        <Text className="text-ui-fg-subtle">
                          {search
                            ? "No products found"
                            : "Search for products to add"}
                        </Text>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {variants.map((variant) => (
                          <button
                            key={variant.id}
                            className="w-full px-4 py-3 text-left hover:bg-ui-bg-subtle transition-colors"
                            onClick={() => setSelectedVariant(variant)}
                          >
                            <Text weight="plus">{variant.product_title}</Text>
                            <Text size="small" className="text-ui-fg-subtle">
                              {variant.title}
                              {variant.sku && ` · ${variant.sku}`}
                            </Text>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-ui-bg-subtle rounded-lg">
                    <div>
                      <Text weight="plus">{selectedVariant.product_title}</Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {selectedVariant.title}
                      </Text>
                    </div>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setSelectedVariant(null)}
                    >
                      Change
                    </Button>
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="override_price">
                      Override Price (optional)
                    </Label>
                    <Input
                      id="override_price"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 9.99"
                      value={overridePrice}
                      onChange={(e) => setOverridePrice(e.target.value)}
                    />
                    <Text size="small" className="text-ui-fg-subtle">
                      Leave empty to use the product's default price
                    </Text>
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="available_quantity">
                      Available Quantity (optional)
                    </Label>
                    <Input
                      id="available_quantity"
                      type="number"
                      placeholder="e.g., 100"
                      value={availableQuantity}
                      onChange={(e) => setAvailableQuantity(e.target.value)}
                    />
                    <Text size="small" className="text-ui-fg-subtle">
                      Leave empty for unlimited availability
                    </Text>
                  </div>
                </>
              )}
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}


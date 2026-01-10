import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Table, Button, Badge } from "@medusajs/ui"
import { DocumentText } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../../lib/sdk"
import { CreateDigitalProductModal } from "./components/create-digital-product-modal"
import { DigitalProduct } from "./types"

const DigitalProductsPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const pageLimit = 20

  const { data, isLoading, refetch } = useQuery<{ 
    digital_products: DigitalProduct[]
    count: number 
  }>({
    queryKey: ["digital-products", currentPage],
    queryFn: () => sdk.client.fetch(`/admin/digital-products?limit=${pageLimit}&offset=${currentPage * pageLimit}`),
  })

  const digitalProducts = data?.digital_products || []
  const count = data?.count || 0
  const pagesCount = Math.ceil(count / pageLimit)
  const canNextPage = currentPage < pagesCount - 1
  const canPreviousPage = currentPage > 0

  const handleCreateProduct = async (productData: any) => {
    await sdk.client.fetch("/admin/digital-products", {
      method: "POST",
      body: productData,
    })
    refetch()
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <DocumentText className="text-ui-fg-subtle" />
          <div>
            <Heading>Digital Products</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Manage your digital products and downloadable files
            </Text>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          Create Digital Product
        </Button>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text>Loading digital products...</Text>
        ) : digitalProducts.length === 0 ? (
          <div className="text-center py-8">
            <DocumentText className="mx-auto h-12 w-12 text-ui-fg-subtle mb-4" />
            <Heading level="h3">No digital products yet</Heading>
            <Text className="text-ui-fg-subtle">
              Create your first digital product to start offering downloadable content
            </Text>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Media Files</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {digitalProducts.map((product) => (
                  <Table.Row key={product.id}>
                    <Table.Cell className="font-medium">
                      {product.name}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-1 flex-wrap">
                        {product.medias?.map((media) => (
                          <Badge 
                            key={media.id} 
                            color={media.type === "main" ? "green" : "blue"} 
                            size="small"
                          >
                            {media.type}
                          </Badge>
                        ))}
                        {(!product.medias || product.medias.length === 0) && (
                          <Text className="text-ui-fg-subtle">No files</Text>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {product.created_at 
                        ? new Date(product.created_at).toLocaleDateString() 
                        : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {product.product_variant?.product_id && (
                        <a 
                          href={`/products/${product.product_variant.product_id}`}
                          className="text-ui-fg-interactive hover:underline"
                        >
                          View Product
                        </a>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            
            {pagesCount > 1 && (
              <Table.Pagination
                count={count}
                pageSize={pageLimit}
                pageIndex={currentPage}
                pageCount={pagesCount}
                canPreviousPage={canPreviousPage}
                canNextPage={canNextPage}
                previousPage={() => setCurrentPage(p => p - 1)}
                nextPage={() => setCurrentPage(p => p + 1)}
              />
            )}
          </>
        )}
      </div>

      <CreateDigitalProductModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProduct}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Digital Products",
  icon: DocumentText,
})

export default DigitalProductsPage

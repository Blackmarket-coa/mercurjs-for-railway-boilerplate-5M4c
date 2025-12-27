import { useState } from "react"
import {
  FocusModal,
  Button,
  Heading,
  Text,
  toast,
} from "@medusajs/ui"
import { ArrowUpTray } from "@medusajs/icons"
import { sdk } from "../../../../lib/client"

interface ImportOFNModalProps {
  open: boolean
  onClose: () => void
  orderCycleId?: string
  onImportComplete?: (products: any[]) => void
}

export const ImportOFNModal = ({
  open,
  onClose,
  orderCycleId,
  onImportComplete,
}: ImportOFNModalProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<any[] | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error("Please select a CSV file")
      return
    }

    setFile(selectedFile)
    setPreview(null)
  }

  const handlePreview = async () => {
    if (!file) return

    setImporting(true)
    try {
      const csvContent = await file.text()
      
      const response = await sdk.client.fetch("/vendor/order-cycles/import", {
        method: "POST",
        body: { csv_content: csvContent },
      })

      if (response.products) {
        setPreview(response.products)
        toast.success(`Found ${response.products.length} products`)
      }
    } catch (error) {
      toast.error("Failed to parse CSV file")
      console.error(error)
    } finally {
      setImporting(false)
    }
  }

  const handleImport = async () => {
    if (!preview) return

    // For now, just pass the parsed products to parent
    onImportComplete?.(preview)
    toast.success(`Imported ${preview.length} products`)
    onClose()
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    onClose()
  }

  const downloadTemplate = () => {
    const template = `producer,sku,name,display_name,category,description,units,unit_type,variant_unit_name,price,on_hand,on_demand,shipping_category,tax_category
"My Farm","SKU001","Organic Tomatoes","Cherry Tomatoes","Vegetables","Fresh organic cherry tomatoes",500,g,,3.50,100,0,,
"My Farm","SKU002","Organic Tomatoes","Beefsteak Tomatoes","Vegetables","Large beefsteak tomatoes",1,kg,,5.00,50,0,,
"My Farm","SKU003","Fresh Eggs","","Eggs","Free-range eggs",1,dozen,,6.00,,1,,
"My Farm","SKU004","Sourdough Bread","","Baked goods","Artisan sourdough loaf",1,,loaf,4.50,20,0,,`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ofn-product-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <FocusModal open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {preview ? (
            <Button onClick={handleImport} disabled={importing}>
              Import {preview.length} Products
            </Button>
          ) : (
            <Button onClick={handlePreview} disabled={!file || importing} isLoading={importing}>
              Preview Import
            </Button>
          )}
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-2xl flex-col gap-y-8">
            <div>
              <Heading>Import Products from Open Food Network</Heading>
              <Text className="text-ui-fg-subtle">
                Upload a CSV file in OFN format to import products
              </Text>
            </div>

            {!preview ? (
              <div className="flex flex-col gap-y-6">
                <div className="border-2 border-dashed border-ui-border-base rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center gap-y-4"
                  >
                    <ArrowUpTray className="w-12 h-12 text-ui-fg-subtle" />
                    <div>
                      <Text className="font-medium">
                        {file ? file.name : "Click to upload CSV"}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        OFN Product List format (.csv)
                      </Text>
                    </div>
                  </label>
                </div>

                <div className="flex justify-center">
                  <Button variant="secondary" size="small" onClick={downloadTemplate}>
                    Download Template
                  </Button>
                </div>

                <div className="bg-ui-bg-subtle rounded-lg p-4">
                  <Text className="font-medium mb-2">Required CSV Columns:</Text>
                  <ul className="text-sm text-ui-fg-subtle space-y-1">
                    <li>• <strong>name</strong> - Product name</li>
                    <li>• <strong>category</strong> - Product category (e.g., Vegetables, Dairy)</li>
                    <li>• <strong>units</strong> - Quantity value (e.g., 500, 1)</li>
                    <li>• <strong>price</strong> - Price per unit</li>
                  </ul>
                  <Text className="font-medium mt-4 mb-2">Optional Columns:</Text>
                  <ul className="text-sm text-ui-fg-subtle space-y-1">
                    <li>• <strong>unit_type</strong> - g, kg, mL, L (for weight/volume)</li>
                    <li>• <strong>variant_unit_name</strong> - For items (e.g., loaf, bunch)</li>
                    <li>• <strong>display_name</strong> - Variant name</li>
                    <li>• <strong>description</strong> - Product description</li>
                    <li>• <strong>sku</strong> - SKU code</li>
                    <li>• <strong>on_hand</strong> - Stock quantity</li>
                    <li>• <strong>on_demand</strong> - 1 for unlimited stock</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-y-4">
                <Text className="font-medium">
                  Preview: {preview.length} products found
                </Text>
                <div className="max-h-96 overflow-y-auto border border-ui-border-base rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-ui-bg-subtle sticky top-0">
                      <tr>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Variants</th>
                        <th className="text-right p-3">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((product, i) => (
                        <tr key={i} className="border-t border-ui-border-base">
                          <td className="p-3">{product.name}</td>
                          <td className="p-3">{product.category}</td>
                          <td className="p-3">{product.variants?.length || 1}</td>
                          <td className="p-3 text-right">
                            ${product.variants?.[0]?.price?.toFixed(2) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="secondary" onClick={() => setPreview(null)}>
                  Back to Upload
                </Button>
              </div>
            )}
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Heading,
  Input,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FilePreview } from "../../../components/common/file-preview"
import { RouteDrawer, useRouteModal } from "../../../components/modals"
import { useImportProducts } from "../../../hooks/api"
import { getProductImportCsvTemplate } from "./helpers/import-template"
import { ImportSummary } from "./components/import-summary"
import { UploadImport } from "./components/upload-import"

type ProductImportSource = "online_store" | "csv"

type ExternalImportCandidate = {
  id: string
  source: "online_store"
  reference: string
  title: string
}

const SOURCE_OPTIONS: { label: string; value: ProductImportSource }[] = [
  { label: "Online store", value: "online_store" },
  { label: "CSV upload", value: "csv" },
]

const SOURCE_HELPERS: Record<ProductImportSource, string> = {
  online_store:
    "Paste product, collection, or shop links from any online store to build your import list.",
  csv: "Upload a CSV file and import many products at once.",
}

export const ProductImport = () => {
  const { t } = useTranslation()

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("products.import.header")}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("products.import.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      <ProductImportContent />
    </RouteDrawer>
  )
}

const ProductImportContent = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const defaultSource = searchParams.get("source") as ProductImportSource | null
  const [filename, setFilename] = useState<string>()
  const [sourceType, setSourceType] = useState<ProductImportSource>(
    defaultSource &&
      SOURCE_OPTIONS.some((option) => option.value === defaultSource)
      ? defaultSource
      : "csv"
  )
  const [sourceReference, setSourceReference] = useState("")
  const [externalCandidates, setExternalCandidates] = useState<
    ExternalImportCandidate[]
  >([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

  const { mutateAsync: importProducts, isPending, data } = useImportProducts()
  const { handleSuccess } = useRouteModal()

  const productImportTemplateContent = useMemo(
    () => getProductImportCsvTemplate(),
    []
  )

  const handleUploaded = async (file: File) => {
    setFilename(file.name)

    await importProducts(
      { file },
      {
        onSuccess: () => {
          toast.info(t("products.import.success.title"))
          handleSuccess()
        },
        onError: (err) => {
          toast.error(err.message)
          setFilename(undefined)
        },
      }
    )
  }

  const handleAddExternalCandidate = () => {
    const trimmedReference = sourceReference.trim()

    if (!trimmedReference || sourceType === "csv") {
      toast.error("Add a source URL or account reference first.")
      return
    }

    const nextCandidate: ExternalImportCandidate = {
      id: `${sourceType}-${Date.now()}`,
      source: sourceType,
      reference: trimmedReference,
      title: `Product from ${trimmedReference}`,
    }

    setExternalCandidates((prev) => [...prev, nextCandidate])
    setSelectedCandidates((prev) => [...prev, nextCandidate.id])
    setSourceReference("")
  }

  const handleToggleCandidate = (id: string, checked: boolean) => {
    setSelectedCandidates((prev) =>
      checked
        ? [...new Set([...prev, id])]
        : prev.filter((candidateId) => candidateId !== id)
    )
  }

  const toggleAllCandidates = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(externalCandidates.map((candidate) => candidate.id))
      return
    }

    setSelectedCandidates([])
  }

  const handleQueueSelected = () => {
    if (!selectedCandidates.length) {
      toast.error("Select at least one product to continue.")
      return
    }

    toast.info(
      `${selectedCandidates.length} products queued for review & publish.`
    )
  }

  const uploadedFileActions = [
    {
      actions: [
        {
          label: t("actions.delete"),
          icon: <Trash />,
          onClick: () => setFilename(undefined),
        },
      ],
    },
  ]

  const allCandidatesSelected =
    externalCandidates.length > 0 &&
    selectedCandidates.length === externalCandidates.length

  return (
    <>
      <RouteDrawer.Body>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h2">Import once from your existing store</Heading>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            External stores are data sources only. Checkout, orders, payments,
            and customer relationship stay in FreeBlackMarket.
          </Text>
        </div>

        <div className="mt-6">
          <Heading level="h2">1) Choose source</Heading>
          <div className="mt-4">
            <Select
              value={sourceType}
              onValueChange={(value) =>
                setSourceType(value as ProductImportSource)
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {SOURCE_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            {SOURCE_HELPERS[sourceType]}
          </Text>
        </div>

        {sourceType === "csv" ? (
          <>
            <Heading className="mt-6" level="h2">
              2) Upload and import
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              CSV import is multi-product by default. Upload one file to create
              or update many products.
            </Text>

            <div className="mt-4">
              {filename ? (
                <FilePreview
                  filename={filename}
                  loading={isPending}
                  activity={t("products.import.upload.preprocessing")}
                  actions={uploadedFileActions}
                />
              ) : (
                <UploadImport onUploaded={handleUploaded} />
              )}
            </div>

            {data?.summary && !!filename && (
              <div className="mt-4">
                <ImportSummary summary={data.summary} />
              </div>
            )}
          </>
        ) : (
          <>
            <Heading className="mt-6" level="h2">
              2) Add source references
            </Heading>

            <div className="mt-3 flex gap-2">
              <Input
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                placeholder="https://shop.example/product or https://etsy.com/shop/..."
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddExternalCandidate}
              >
                Add
              </Button>
            </div>

            <div className="mt-4 rounded-lg border border-ui-border-base p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allCandidatesSelected}
                    onCheckedChange={(checked) =>
                      toggleAllCandidates(!!checked)
                    }
                  />
                  <Text size="small" weight="plus">
                    Select all
                  </Text>
                </div>
                <Badge size="2xsmall" color="grey">
                  {selectedCandidates.length} selected
                </Badge>
              </div>

              <div className="space-y-2">
                {externalCandidates.length ? (
                  externalCandidates.map((candidate) => {
                    const checked = selectedCandidates.includes(candidate.id)

                    return (
                      <label
                        key={candidate.id}
                        className="flex cursor-pointer items-start gap-2 rounded-md border border-ui-border-base px-3 py-2"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            handleToggleCandidate(candidate.id, !!value)
                          }
                        />
                        <div>
                          <Text size="small" weight="plus">
                            {candidate.title}
                          </Text>
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            Online store ·{" "}
                            {candidate.reference}
                          </Text>
                        </div>
                      </label>
                    )
                  })
                ) : (
                  <Text size="small" className="text-ui-fg-subtle">
                    Add references to build a product selection list.
                  </Text>
                )}
              </div>

              <div className="mt-3">
                <Button
                  type="button"
                  size="small"
                  onClick={handleQueueSelected}
                >
                  Import selected products
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 rounded-lg border border-ui-border-base p-4">
          <Heading level="h3">3) Review & publish</Heading>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            Product names, descriptions, images, variants, pricing, and
            inventory are normalized before publish. FBM price and inventory are
            canonical.
          </Text>
        </div>

        <Heading className="mt-6" level="h2">
          {t("products.import.template.title")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("products.import.template.description")}
        </Text>
        <div className="mt-4">
          <FilePreview
            filename="product-import-template.csv"
            url={productImportTemplateContent}
          />
        </div>
      </RouteDrawer.Body>
      <RouteDrawer.Footer>
        <RouteDrawer.Close asChild>
          <Button size="small" variant="secondary">
            {t("actions.cancel")}
          </Button>
        </RouteDrawer.Close>
      </RouteDrawer.Footer>
    </>
  )
}

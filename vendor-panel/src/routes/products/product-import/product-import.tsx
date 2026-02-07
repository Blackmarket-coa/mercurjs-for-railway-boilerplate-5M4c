import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FilePreview } from "../../../components/common/file-preview"
import { RouteDrawer, useRouteModal } from "../../../components/modals"
import { useImportProducts } from "../../../hooks/api"
import {
  useWooConnection,
  useConnectWooCommerce,
  useDisconnectWooCommerce,
  useWooPreview,
  useWooImport,
} from "../../../hooks/api"
import { getProductImportCsvTemplate } from "./helpers/import-template"
import { ImportSummary } from "./components/import-summary"
import { UploadImport } from "./components/upload-import"

type ProductImportSource = "woocommerce" | "online_store" | "csv"

type ExternalImportCandidate = {
  id: string
  source: "online_store"
  reference: string
  title: string
}

const SOURCE_OPTIONS: { label: string; value: ProductImportSource }[] = [
  { label: "WooCommerce", value: "woocommerce" },
  { label: "Online store", value: "online_store" },
  { label: "CSV upload", value: "csv" },
]

const SOURCE_HELPERS: Record<ProductImportSource, string> = {
  woocommerce:
    "Connect your WooCommerce store with API credentials to import all products automatically.",
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
      : "woocommerce"
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
      source: "online_store",
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

        {sourceType === "woocommerce" && <WooCommerceImportSection />}

        {sourceType === "csv" && (
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
        )}

        {sourceType === "online_store" && (
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
          <Heading level="h3">
            {sourceType === "woocommerce" ? "3" : "3"}) Review & publish
          </Heading>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            Product names, descriptions, images, variants, pricing, and
            inventory are normalized before publish. FBM price and inventory are
            canonical.
          </Text>
        </div>

        {sourceType !== "woocommerce" && (
          <>
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
          </>
        )}
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

/**
 * WooCommerce-specific import section: connect, preview, import.
 */
const WooCommerceImportSection = () => {
  const { connection, isLoading: isLoadingConnection } = useWooConnection()
  const isConnected = !!connection

  return (
    <div className="mt-6">
      {isLoadingConnection ? (
        <div className="flex items-center justify-center py-8">
          <Text size="small" className="text-ui-fg-subtle">
            Checking WooCommerce connection...
          </Text>
        </div>
      ) : isConnected ? (
        <WooConnectedView connection={connection} />
      ) : (
        <WooConnectForm />
      )}
    </div>
  )
}

/**
 * Form to connect a WooCommerce store.
 */
const WooConnectForm = () => {
  const [storeUrl, setStoreUrl] = useState("")
  const [consumerKey, setConsumerKey] = useState("")
  const [consumerSecret, setConsumerSecret] = useState("")

  const { mutateAsync: connect, isPending } = useConnectWooCommerce()

  const handleConnect = async () => {
    if (!storeUrl || !consumerKey || !consumerSecret) {
      toast.error("All fields are required.")
      return
    }

    try {
      new URL(storeUrl)
    } catch {
      toast.error("Enter a valid store URL (e.g. https://mystore.com).")
      return
    }

    await connect(
      {
        store_url: storeUrl.replace(/\/+$/, ""),
        consumer_key: consumerKey.trim(),
        consumer_secret: consumerSecret.trim(),
      },
      {
        onSuccess: (data) => {
          toast.success(
            data.message || "WooCommerce store connected successfully."
          )
        },
        onError: (err) => {
          toast.error(err.message || "Failed to connect WooCommerce store.")
        },
      }
    )
  }

  return (
    <>
      <Heading level="h2">2) Connect your WooCommerce store</Heading>
      <Text size="small" className="mt-1 text-ui-fg-subtle">
        Enter your WooCommerce REST API credentials. You can generate them in
        WooCommerce &rarr; Settings &rarr; Advanced &rarr; REST API.
      </Text>

      <div className="mt-4 space-y-3">
        <div>
          <Label size="xsmall" weight="plus">
            Store URL
          </Label>
          <Input
            className="mt-1"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="https://mystore.com"
          />
        </div>
        <div>
          <Label size="xsmall" weight="plus">
            Consumer Key
          </Label>
          <Input
            className="mt-1"
            value={consumerKey}
            onChange={(e) => setConsumerKey(e.target.value)}
            placeholder="ck_..."
          />
        </div>
        <div>
          <Label size="xsmall" weight="plus">
            Consumer Secret
          </Label>
          <Input
            className="mt-1"
            type="password"
            value={consumerSecret}
            onChange={(e) => setConsumerSecret(e.target.value)}
            placeholder="cs_..."
          />
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          size="small"
          onClick={handleConnect}
          isLoading={isPending}
        >
          Connect store
        </Button>
      </div>
    </>
  )
}

/**
 * View shown when WooCommerce is already connected: preview + import.
 */
const WooConnectedView = ({
  connection,
}: {
  connection: {
    id: string
    store_url: string
    store_name: string
    currency: string
    last_synced_at?: string
  }
}) => {
  const [importAsDraft, setImportAsDraft] = useState(true)
  const [enableSync, setEnableSync] = useState(true)
  const [importResult, setImportResult] = useState<{
    message: string
    result?: { imported: number; failed: number; skipped: number }
  } | null>(null)

  const {
    preview,
    isLoading: isLoadingPreview,
    error: previewError,
  } = useWooPreview({ enabled: true })

  const { mutateAsync: startImport, isPending: isImporting } = useWooImport()
  const { mutateAsync: disconnect, isPending: isDisconnecting } =
    useDisconnectWooCommerce()

  const handleImport = async () => {
    await startImport(
      {
        import_as_draft: importAsDraft,
        enable_inventory_sync: enableSync,
      },
      {
        onSuccess: (data) => {
          setImportResult(data)
          toast.success(data.message || "Import completed.")
        },
        onError: (err) => {
          toast.error(err.message || "Import failed.")
        },
      }
    )
  }

  const handleDisconnect = async () => {
    await disconnect(undefined, {
      onSuccess: () => {
        toast.info("WooCommerce store disconnected.")
      },
      onError: (err) => {
        toast.error(err.message || "Failed to disconnect.")
      },
    })
  }

  return (
    <>
      {/* Connection status */}
      <div className="rounded-lg border border-ui-border-base p-4">
        <div className="flex items-center justify-between">
          <div>
            <Text size="small" weight="plus">
              {connection.store_name || "WooCommerce Store"}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {connection.store_url} · {connection.currency}
            </Text>
          </div>
          <Badge size="2xsmall" color="green">
            Connected
          </Badge>
        </div>
        <div className="mt-2">
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={handleDisconnect}
            isLoading={isDisconnecting}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Product preview */}
      <Heading className="mt-6" level="h2">
        2) Preview products
      </Heading>

      {isLoadingPreview ? (
        <Text size="small" className="mt-2 text-ui-fg-subtle">
          Fetching products from WooCommerce...
        </Text>
      ) : previewError ? (
        <Text size="small" className="mt-2 text-ui-fg-on-color text-red-500">
          Failed to load preview. Check your WooCommerce connection.
        </Text>
      ) : preview ? (
        <div className="mt-3 rounded-lg border border-ui-border-base p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Total products
              </Text>
              <Text size="small" weight="plus">
                {preview.total_products}
              </Text>
            </div>
            <div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Simple products
              </Text>
              <Text size="small" weight="plus">
                {preview.simple_products}
              </Text>
            </div>
            <div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Variable products
              </Text>
              <Text size="small" weight="plus">
                {preview.variable_products}
              </Text>
            </div>
            {preview.skipped_products > 0 && (
              <div>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Skipped (unsupported type)
                </Text>
                <Text size="small" weight="plus">
                  {preview.skipped_products}
                </Text>
              </div>
            )}
          </div>
          {preview.categories?.length > 0 && (
            <div className="mt-3">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Categories
              </Text>
              <div className="mt-1 flex flex-wrap gap-1">
                {preview.categories.slice(0, 10).map((cat: any) => (
                  <Badge key={cat.id} size="2xsmall" color="grey">
                    {cat.name}
                  </Badge>
                ))}
                {preview.categories.length > 10 && (
                  <Badge size="2xsmall" color="grey">
                    +{preview.categories.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Import options */}
      <Heading className="mt-6" level="h2">
        3) Import options
      </Heading>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Text size="small" weight="plus">
              Import as draft
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Products will be created in draft status for review before
              publishing.
            </Text>
          </div>
          <Switch
            checked={importAsDraft}
            onCheckedChange={setImportAsDraft}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Text size="small" weight="plus">
              Enable inventory sync
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Periodically sync stock levels from WooCommerce.
            </Text>
          </div>
          <Switch checked={enableSync} onCheckedChange={setEnableSync} />
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          size="small"
          onClick={handleImport}
          isLoading={isImporting}
          disabled={!preview || preview.total_products === 0}
        >
          Import {preview?.total_products ?? 0} products
        </Button>
      </div>

      {/* Import result */}
      {importResult?.result && (
        <div className="mt-4 rounded-lg border border-ui-border-base p-4">
          <Heading level="h3">Import results</Heading>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Imported
              </Text>
              <Text size="small" weight="plus">
                {importResult.result.imported}
              </Text>
            </div>
            <div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Failed
              </Text>
              <Text size="small" weight="plus">
                {importResult.result.failed}
              </Text>
            </div>
            <div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Skipped
              </Text>
              <Text size="small" weight="plus">
                {importResult.result.skipped}
              </Text>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

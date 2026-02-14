import { useState, useMemo } from "react"
import { Badge, Button, Container, Heading, Switch, Text, toast } from "@medusajs/ui"

import { useMe, useUpdateMe } from "../../../hooks/api/users"
import {
  useVendorType,
  ALL_EXTENSION_OPTIONS,
  type VendorFeatures,
} from "../../../providers/vendor-type-provider"
import { SingleColumnPageSkeleton } from "../../../components/common/skeleton"

export const ExtensionsSettings = () => {
  const { seller, isPending: sellerPending } = useMe()
  const {
    features,
    defaultFeatures,
    enabledExtensions,
    typeLabel,
  } = useVendorType()
  const { mutateAsync: updateMe, isPending: isSaving } = useUpdateMe()

  // Local toggle state: initialized from current features
  const [localToggles, setLocalToggles] = useState<Record<string, boolean> | null>(null)

  // Build the effective toggle state
  const toggleState = useMemo(() => {
    if (localToggles) return localToggles

    // Derive from current features
    const state: Record<string, boolean> = {}
    for (const opt of ALL_EXTENSION_OPTIONS) {
      state[opt.key] = features[opt.key]
    }
    return state
  }, [localToggles, features])

  // Track whether there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!localToggles) return false

    // Compare with current effective features
    for (const opt of ALL_EXTENSION_OPTIONS) {
      if (localToggles[opt.key] !== features[opt.key]) {
        return true
      }
    }
    return false
  }, [localToggles, features])

  const handleToggle = (key: keyof VendorFeatures) => {
    setLocalToggles((prev) => {
      const current = prev ?? { ...toggleState }
      return { ...current, [key]: !current[key] }
    })
  }

  const handleSave = async () => {
    // Build the enabled_extensions array from toggle state
    const enabledKeys = ALL_EXTENSION_OPTIONS
      .filter((opt) => toggleState[opt.key])
      .map((opt) => opt.key)

    try {
      const currentMetadata =
        seller?.metadata && typeof seller.metadata === "object"
          ? seller.metadata
          : {}

      await updateMe(
        {
          metadata: {
            ...currentMetadata,
            enabled_extensions: enabledKeys,
          },
        } as any,
        {
          onSuccess: () => {
            toast.success("Dashboard extensions updated successfully")
            setLocalToggles(null) // Reset local state
          },
          onError: (err) => {
            toast.error(err.message || "Failed to update extensions")
          },
        }
      )
    } catch {
      // handled by onError
    }
  }

  const handleResetToDefaults = async () => {
    try {
      const currentMetadata =
        seller?.metadata && typeof seller.metadata === "object"
          ? seller.metadata
          : {}

      await updateMe(
        {
          metadata: {
            ...currentMetadata,
            enabled_extensions: null,
          },
        } as any,
        {
          onSuccess: () => {
            toast.success("Extensions reset to defaults for your vendor type")
            setLocalToggles(null)
          },
          onError: (err) => {
            toast.error(err.message || "Failed to reset extensions")
          },
        }
      )
    } catch {
      // handled by onError
    }
  }

  if (sellerPending || !seller) {
    return <SingleColumnPageSkeleton sections={1} />
  }

  return (
    <div className="flex flex-col gap-y-3">
      {/* Header */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Dashboard Extensions</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Choose which extensions appear on your dashboard. All extensions are available regardless of vendor type.
            </Text>
          </div>
          <div className="flex items-center gap-x-2">
            {enabledExtensions && (
              <Button
                size="small"
                variant="secondary"
                onClick={handleResetToDefaults}
                disabled={isSaving}
              >
                Reset to Defaults
              </Button>
            )}
            <Button
              size="small"
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Current vendor type info */}
        <div className="px-6 py-3 bg-ui-bg-subtle flex items-center gap-x-2">
          <Text size="small" className="text-ui-fg-subtle">
            Vendor Type:
          </Text>
          <Badge size="xsmall" color="grey">
            {typeLabel}
          </Badge>
          {enabledExtensions ? (
            <Text size="xsmall" className="text-ui-fg-muted ml-2">
              Using custom extensions
            </Text>
          ) : (
            <Text size="xsmall" className="text-ui-fg-muted ml-2">
              Using default extensions for your type
            </Text>
          )}
        </div>
      </Container>

      {/* Extension toggles */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Available Extensions</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Toggle extensions on or off to customize your dashboard navigation and features.
          </Text>
        </div>

        {ALL_EXTENSION_OPTIONS.map((opt) => {
          const isEnabled = toggleState[opt.key] ?? false
          const isDefault = defaultFeatures[opt.key]

          return (
            <div
              key={opt.key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex flex-col gap-y-0.5 flex-1 mr-4">
                <div className="flex items-center gap-x-2">
                  <Text size="small" weight="plus" leading="compact">
                    {opt.label}
                  </Text>
                  {isDefault && (
                    <Badge size="xsmall" color="green">
                      Default
                    </Badge>
                  )}
                </div>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {opt.description}
                </Text>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={() => handleToggle(opt.key)}
              />
            </div>
          )
        })}
      </Container>
    </div>
  )
}

import { useTranslation } from "react-i18next"

import type { Filter } from "../../../components/table/data-table"

export const useOrderTableFilters = (): Filter[] => {
  const { t } = useTranslation()

  let filters: Filter[] = []

  const paymentStatusFilter: Filter = {
    key: "payment_status",
    label: t("orders.payment.statusLabel"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("orders.payment.status.notPaid"),
        value: "not_paid",
      },
      {
        label: t("orders.payment.status.awaiting"),
        value: "awaiting",
      },
      {
        label: t("orders.payment.status.captured"),
        value: "captured",
      },
      {
        label: t("orders.payment.status.refunded"),
        value: "refunded",
      },
      {
        label: t("orders.payment.status.partiallyRefunded"),
        value: "partially_refunded",
      },
      {
        label: t("orders.payment.status.canceled"),
        value: "canceled",
      },
      {
        label: t("orders.payment.status.requiresAction"),
        value: "requires_action",
      },
    ],
  }

  const fulfillmentStatusFilter: Filter = {
    key: "fulfillment_status",
    label: t("orders.fulfillment.statusLabel"),
    type: "select",
    multiple: true,
    options: [
      {
        label: t("orders.fulfillment.status.notFulfilled"),
        value: "not_fulfilled",
      },
      {
        label: t("orders.fulfillment.status.fulfilled"),
        value: "fulfilled",
      },
      {
        label: t("orders.fulfillment.status.partiallyFulfilled"),
        value: "partially_fulfilled",
      },
      {
        label: t("orders.fulfillment.status.returned"),
        value: "returned",
      },
      {
        label: t("orders.fulfillment.status.partiallyReturned"),
        value: "partially_returned",
      },
      {
        label: t("orders.fulfillment.status.shipped"),
        value: "shipped",
      },
      {
        label: t("orders.fulfillment.status.partiallyShipped"),
        value: "partially_shipped",
      },
      {
        label: t("orders.fulfillment.status.canceled"),
        value: "canceled",
      },
      {
        label: t("orders.fulfillment.status.requiresAction"),
        value: "requires_action",
      },
    ],
  }

  const dateFilters: Filter[] = [
    { label: "Created At", key: "created_at" },
    { label: "Updated At", key: "updated_at" },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date",
  }))

  filters = [
    ...filters,
    paymentStatusFilter,
    fulfillmentStatusFilter,
    ...dateFilters,
  ]

  return filters
}

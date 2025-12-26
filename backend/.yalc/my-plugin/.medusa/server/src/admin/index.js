"use strict";
const jsxRuntime = require("react/jsx-runtime");
const adminSdk = require("@medusajs/admin-sdk");
const icons = require("@medusajs/icons");
const ui = require("@medusajs/ui");
const reactQuery = require("@tanstack/react-query");
const reactRouterDom = require("react-router-dom");
const React = require("react");
const Medusa = require("@medusajs/js-sdk");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const React__default = /* @__PURE__ */ _interopDefault(React);
const Medusa__default = /* @__PURE__ */ _interopDefault(Medusa);
const sdk = new Medusa__default.default({
  baseUrl: "/",
  debug: false,
  auth: {
    type: "session"
  }
});
const ProductDetailsStep = ({
  name,
  setName,
  selectedVenueId,
  setSelectedVenueId,
  selectedDates,
  setSelectedDates,
  venues
}) => {
  const selectedVenue = venues.find((v) => v.id === selectedVenueId);
  const [startDate, setStartDate] = React.useState(
    selectedDates.length > 0 ? /* @__PURE__ */ new Date(selectedDates[0] + "T00:00:00") : void 0
  );
  const [endDate, setEndDate] = React.useState(
    selectedDates.length > 1 ? /* @__PURE__ */ new Date(selectedDates[selectedDates.length - 1] + "T00:00:00") : void 0
  );
  const generateDateRange = (start, end) => {
    const dates = [];
    const currentDate = new Date(start);
    do {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    } while (end && currentDate <= end);
    return dates;
  };
  const handleStartDateChange = (date) => {
    const dateValue = date || void 0;
    setStartDate(dateValue);
    setSelectedDates(
      dateValue ? generateDateRange(dateValue, endDate) : []
    );
  };
  const handleEndDateChange = (date) => {
    const dateValue = date || void 0;
    setEndDate(dateValue);
    if (startDate && dateValue) {
      setSelectedDates(generateDateRange(startDate, dateValue));
    } else if (dateValue) {
      setSelectedDates(generateDateRange(dateValue));
    } else {
      setSelectedDates([]);
    }
  };
  const removeDate = (dateToRemove) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateToRemove));
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Show Details" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "name", children: "Name" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Input,
        {
          id: "name",
          value: name,
          onChange: (e) => setName(e.target.value),
          placeholder: "Enter name"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "venue", children: "Venue" }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Select,
        {
          value: selectedVenueId,
          onValueChange: setSelectedVenueId,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, { placeholder: "Select a venue" }) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Content, { children: venues.map((venue) => /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: venue.id, children: venue.name }, venue.id)) })
          ]
        }
      )
    ] }),
    selectedVenue && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-4 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { className: "txt-small-plus mb-2", children: [
        "Selected Venue: ",
        selectedVenue.name
      ] }),
      selectedVenue.address && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "txt-small text-ui-fg-subtle mb-2", children: selectedVenue.address }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { className: "txt-small text-ui-fg-subtle", children: [
        "Rows: ",
        [...new Set(selectedVenue.rows.map((row) => row.row_type))].join(", "),
        /* @__PURE__ */ jsxRuntime.jsx("br", {}),
        "Total Seats: ",
        selectedVenue.rows.reduce((acc, row) => acc + row.seat_count, 0)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "my-6" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "Dates" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "start-date", children: "Start Date" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.DatePicker,
              {
                value: startDate,
                onChange: handleStartDateChange,
                maxValue: endDate
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "end-date", children: "End Date" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.DatePicker,
              {
                value: endDate,
                onChange: handleEndDateChange,
                minValue: startDate
              }
            )
          ] })
        ] }),
        selectedDates.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { className: "txt-small-plus", children: [
            "Selected Dates (",
            selectedDates.length,
            " day",
            selectedDates.length !== 1 ? "s" : "",
            "):"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-2", children: selectedDates.map((date) => /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Badge,
            {
              color: "blue",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: new Date(date).toLocaleDateString() }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Button,
                  {
                    variant: "transparent",
                    size: "small",
                    onClick: () => removeDate(date),
                    className: "p-1 hover:bg-transparent",
                    children: /* @__PURE__ */ jsxRuntime.jsx(icons.XMark, {})
                  }
                )
              ]
            },
            date
          )) })
        ] })
      ] })
    ] })
  ] });
};
var RowType = /* @__PURE__ */ ((RowType2) => {
  RowType2["PREMIUM"] = "premium";
  RowType2["BALCONY"] = "balcony";
  RowType2["STANDARD"] = "standard";
  RowType2["VIP"] = "vip";
  return RowType2;
})(RowType || {});
const PricingStep = ({
  selectedVenue,
  currencyRegionCombinations,
  prices,
  setPrices
}) => {
  if (!selectedVenue) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: "Please select a venue in the previous step" }) });
  }
  const updatePrice = (rowType, currency, regionId, amount) => {
    const key = regionId ? `${currency}_${regionId}` : `${currency}_store`;
    setPrices({
      ...prices,
      [rowType]: {
        ...prices[rowType],
        [key]: amount
      }
    });
  };
  const getRowTypeColor2 = (type) => {
    switch (type) {
      case RowType.VIP:
        return "purple";
      case RowType.PREMIUM:
        return "orange";
      case RowType.BALCONY:
        return "blue";
      default:
        return "grey";
    }
  };
  const getRowTypeLabel2 = (type) => {
    switch (type) {
      case RowType.VIP:
        return "VIP";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  const rowTypes = [...new Set(selectedVenue.rows.map((row) => row.row_type))];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h3", children: "Set Prices for Each Row Type" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-gray-600", children: "Enter prices for each row type by region and currency. All prices are optional." })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-4", children: rowTypes.map((rowType) => {
      const totalSeats = selectedVenue.rows.filter((row) => row.row_type === rowType).reduce((sum, row) => sum + row.seat_count, 0);
      return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: getRowTypeColor2(rowType), size: "small", children: getRowTypeLabel2(rowType) }),
          /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { className: "txt-small text-gray-600", children: [
            totalSeats,
            " seats total"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: currencyRegionCombinations.map((combo) => {
          var _a;
          const key = combo.region_id ? `${combo.currency}_${combo.region_id}` : `${combo.currency}_store`;
          return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Label, { htmlFor: `${rowType}-${key}`, children: [
              combo.currency.toUpperCase(),
              " - ",
              combo.region_name || "Store"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                id: `${rowType}-${key}`,
                type: "number",
                min: "0",
                step: "0.01",
                value: ((_a = prices[rowType]) == null ? void 0 : _a[key]) || "",
                onChange: (e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  updatePrice(rowType, combo.currency, combo.region_id, amount);
                },
                placeholder: "0.00"
              }
            )
          ] }, key);
        }) })
      ] }, rowType);
    }) })
  ] });
};
const CreateTicketProductModal = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = React.useState("0");
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [selectedVenueId, setSelectedVenueId] = React.useState("");
  const [selectedDates, setSelectedDates] = React.useState([]);
  const [prices, setPrices] = React.useState({});
  const { data: venuesData } = reactQuery.useQuery({
    queryKey: ["venues"],
    queryFn: () => sdk.client.fetch("/admin/venues")
  });
  const { data: regionsData } = reactQuery.useQuery({
    queryKey: ["regions"],
    queryFn: () => sdk.admin.region.list()
  });
  const { data: storesData } = reactQuery.useQuery({
    queryKey: ["stores"],
    queryFn: () => sdk.admin.store.list()
  });
  const venues = (venuesData == null ? void 0 : venuesData.venues) || [];
  const regions = (regionsData == null ? void 0 : regionsData.regions) || [];
  const stores = (storesData == null ? void 0 : storesData.stores) || [];
  const selectedVenue = venues == null ? void 0 : venues.find((v) => v.id === selectedVenueId);
  const currencyRegionCombinations = React__default.default.useMemo(() => {
    const combinations = [];
    regions.forEach((region) => {
      combinations.push({
        currency: region.currency_code,
        region_id: region.id,
        region_name: region.name,
        is_store_currency: false
      });
    });
    stores.forEach((store) => {
      store.supported_currencies.forEach((currency) => {
        combinations.push({
          currency: currency.currency_code,
          region_id: void 0,
          // No region for store currencies
          is_store_currency: true
        });
      });
    });
    return combinations;
  }, [regions, stores]);
  const resetForm = () => {
    setName("");
    setSelectedVenueId("");
    setSelectedDates([]);
    setPrices({});
    setCurrentStep("0");
  };
  const handleCloseModal = (open2) => {
    if (!open2) {
      resetForm();
    }
    onOpenChange(open2);
  };
  const handleStep1Next = () => {
    if (!name.trim()) {
      ui.toast.error("Name is required");
      return;
    }
    if (!selectedVenueId) {
      ui.toast.error("Please select a venue");
      return;
    }
    if (selectedDates.length === 0) {
      ui.toast.error("Please select at least one date");
      return;
    }
    setCurrentStep("1");
  };
  const handleStep2Submit = async () => {
    if (!selectedVenue) {
      ui.toast.error("Venue not found");
      return;
    }
    const combinedRows = {
      premium: { seat_count: 0 },
      balcony: { seat_count: 0 },
      standard: { seat_count: 0 },
      vip: { seat_count: 0 }
    };
    selectedVenue.rows.forEach((row) => {
      if (!combinedRows[row.row_type]) {
        combinedRows[row.row_type] = { seat_count: 0 };
      }
      combinedRows[row.row_type].seat_count += row.seat_count;
    });
    const variants = Object.keys(combinedRows).map((rowType) => ({
      row_type: rowType,
      seat_count: combinedRows[rowType].seat_count,
      prices: currencyRegionCombinations.map((combo) => {
        var _a;
        const key = combo.region_id ? `${combo.currency}_${combo.region_id}` : `${combo.currency}_store`;
        const amount = ((_a = prices[rowType]) == null ? void 0 : _a[key]) || 0;
        const price = {
          currency_code: combo.currency,
          amount
        };
        if (combo.region_id && !combo.is_store_currency) {
          price.rules = {
            region_id: combo.region_id
          };
        }
        return price;
      }).filter((price) => price.amount > 0)
      // Only include prices > 0
    })).filter((variant) => variant.seat_count > 0);
    setIsLoading(true);
    try {
      await onSubmit({
        name,
        venue_id: selectedVenueId,
        dates: selectedDates,
        variants
      });
      ui.toast.success("Show created successfully");
      handleCloseModal(false);
    } catch (error) {
      ui.toast.error(error.message || "Failed to create show");
    } finally {
      setIsLoading(false);
    }
  };
  const isStep1Completed = name.trim() && selectedVenueId && selectedDates.length > 0;
  const hasAnyPrices = Object.values(prices).some(
    (rowPrices) => Object.values(rowPrices).some((amount) => amount > 0)
  );
  const isStep2Completed = isStep1Completed && hasAnyPrices;
  const steps = [
    {
      label: "Product Details",
      value: "0",
      status: isStep1Completed ? "completed" : void 0,
      content: /* @__PURE__ */ jsxRuntime.jsx(
        ProductDetailsStep,
        {
          name,
          setName,
          selectedVenueId,
          setSelectedVenueId,
          selectedDates,
          setSelectedDates,
          venues
        }
      )
    },
    {
      label: "Pricing",
      value: "1",
      status: isStep2Completed ? "completed" : void 0,
      content: /* @__PURE__ */ jsxRuntime.jsx(
        PricingStep,
        {
          selectedVenue,
          currencyRegionCombinations,
          prices,
          setPrices
        }
      )
    }
  ];
  return /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal, { open, onOpenChange: handleCloseModal, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.FocusModal.Content, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Header, { className: "justify-start py-0", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-4 w-full", children: /* @__PURE__ */ jsxRuntime.jsx(
      ui.ProgressTabs,
      {
        value: currentStep,
        onValueChange: setCurrentStep,
        className: "w-full",
        children: /* @__PURE__ */ jsxRuntime.jsx(ui.ProgressTabs.List, { className: "w-full", children: steps.map((step) => /* @__PURE__ */ jsxRuntime.jsx(
          ui.ProgressTabs.Trigger,
          {
            value: step.value,
            status: step.status,
            children: step.label
          },
          step.value
        )) })
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Body, { className: "flex flex-1 flex-col p-6", children: /* @__PURE__ */ jsxRuntime.jsx(
      ui.ProgressTabs,
      {
        value: currentStep,
        onValueChange: setCurrentStep,
        className: "flex-1 w-full mx-auto",
        children: steps.map((step) => /* @__PURE__ */ jsxRuntime.jsx(ui.ProgressTabs.Content, { value: step.value, className: "flex-1", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-[720px] mx-auto", children: step.content }) }, step.value))
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.FocusModal.Footer, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          variant: "secondary",
          onClick: () => setCurrentStep(currentStep === "1" ? "0" : "0"),
          disabled: currentStep === "0",
          children: "Previous"
        }
      ),
      currentStep === "0" ? /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          variant: "primary",
          onClick: handleStep1Next,
          children: "Next"
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          variant: "primary",
          onClick: handleStep2Submit,
          isLoading,
          children: "Create Show"
        }
      )
    ] })
  ] }) });
};
const columnHelper$1 = ui.createDataTableColumnHelper();
const columns$1 = [
  columnHelper$1.accessor("product.title", {
    header: "Name"
  }),
  columnHelper$1.accessor("venue.name", {
    header: "Venue"
  }),
  columnHelper$1.accessor("dates", {
    header: "Dates",
    cell: ({ row }) => {
      const dates = row.original.dates || [];
      const displayDates = [dates[0], dates[dates.length - 1]];
      return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-1 items-center", children: displayDates.map((date, index) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { color: "grey", size: "small", children: new Date(date).toLocaleDateString() }),
        index < displayDates.length - 1 && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray-500 txt-small", children: "-" })
      ] }, date)) });
    }
  }),
  columnHelper$1.accessor("product_id", {
    header: "Product",
    cell: ({ row }) => {
      return /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: `/products/${row.original.product_id}`, children: "View Product Details" });
    }
  })
];
const TicketProductsPage = () => {
  const limit = 15;
  const [pagination, setPagination] = React.useState({
    pageSize: limit,
    pageIndex: 0
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const queryClient = reactQuery.useQueryClient();
  const offset = React.useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);
  const { data, isLoading } = reactQuery.useQuery({
    queryKey: ["ticket-products", offset, limit],
    queryFn: () => sdk.client.fetch("/admin/ticket-products", {
      query: {
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
        order: "-created_at"
      }
    })
  });
  const table = ui.useDataTable({
    columns: columns$1,
    data: (data == null ? void 0 : data.ticket_products) || [],
    rowCount: (data == null ? void 0 : data.count) || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    getRowId: (row) => row.id
  });
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleCreateTicketProduct = async (data2) => {
    try {
      await sdk.client.fetch("/admin/ticket-products", {
        method: "POST",
        body: data2
      });
      queryClient.invalidateQueries({ queryKey: ["ticket-products"] });
      handleCloseModal();
    } catch (error) {
      ui.toast.error(`Failed to create show: ${error.message}`);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "divide-y p-0", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable, { instance: table, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable.Toolbar, { className: "flex flex-col items-start justify-between gap-2 md:flex-row md:items-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: "Shows" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Button,
          {
            variant: "secondary",
            onClick: () => setIsModalOpen(true),
            children: "Create Show"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Table, {}),
      /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Pagination, {})
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      CreateTicketProductModal,
      {
        open: isModalOpen,
        onOpenChange: handleCloseModal,
        onSubmit: handleCreateTicketProduct
      }
    )
  ] });
};
const config$1 = adminSdk.defineRouteConfig({
  label: "Shows",
  icon: icons.ReceiptPercent
});
const getRowTypeColor = (rowType) => {
  switch (rowType) {
    case RowType.VIP:
      return "bg-purple-500";
    case RowType.PREMIUM:
      return "bg-orange-500";
    case RowType.BALCONY:
      return "bg-blue-500";
    case RowType.STANDARD:
      return "bg-gray-500";
    default:
      return "bg-gray-300";
  }
};
const getRowTypeLabel = (rowType) => {
  switch (rowType) {
    case RowType.VIP:
      return "VIP";
    case RowType.PREMIUM:
      return "Premium";
    case RowType.BALCONY:
      return "Balcony";
    case RowType.STANDARD:
      return "Standard";
    default:
      return "Unknown";
  }
};
const SeatChart = ({ rows, className = "" }) => {
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `p-8 text-center text-gray-500 ${className}`, children: /* @__PURE__ */ jsxRuntime.jsx("p", { children: "No rows added yet. Add rows to see the seat chart." }) });
  }
  const sortedRows = [...rows].sort((a, b) => a.row_number.localeCompare(b.row_number));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `space-y-4 ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h3", children: "Seat Chart Preview" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4 txt-small", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-4 h-4 bg-purple-500 rounded" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "VIP" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-4 h-4 bg-orange-500 rounded" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Premium" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-4 h-4 bg-blue-500 rounded" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Balcony" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-4 h-4 bg-gray-500 rounded" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Standard" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border rounded-lg p-4 bg-gray-50", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[auto_auto_1fr_auto] gap-4 items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small-plus text-gray-700 text-center", children: "Row" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small-plus text-gray-700 text-center", children: "Type" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small-plus text-gray-700 text-center", children: "Seats" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small-plus text-gray-700 text-center", children: "Count" }),
      sortedRows.map((row) => /* @__PURE__ */ jsxRuntime.jsxs(React__default.default.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small-plus text-gray-700 text-center", children: row.row_number }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: `w-4 h-4 rounded ${getRowTypeColor(row.row_type)}` }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "txt-small text-gray-600", children: getRowTypeLabel(row.row_type) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-center gap-1 flex-wrap", children: Array.from({ length: row.seat_count }, (_, i) => /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: `w-3 h-3 rounded-sm ${getRowTypeColor(row.row_type)} opacity-70`
          },
          i
        )) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small text-gray-500 text-center", children: row.seat_count })
      ] }, row.row_number))
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "txt-small text-gray-500", children: [
      "Total capacity: ",
      rows.reduce((sum, row) => sum + row.seat_count, 0),
      " seats"
    ] })
  ] });
};
const CreateVenueModal = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [newRow, setNewRow] = React.useState({
    row_number: "",
    row_type: RowType.VIP,
    seat_count: 10
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const addRow = () => {
    if (!newRow.row_number.trim()) {
      ui.toast.error("Row number is required");
      return;
    }
    if (rows.some((row) => row.row_number === newRow.row_number)) {
      ui.toast.error("Row number already exists");
      return;
    }
    if (newRow.seat_count <= 0) {
      ui.toast.error("Seat count must be greater than 0");
      return;
    }
    setRows([...rows, {
      row_number: newRow.row_number,
      row_type: newRow.row_type,
      seat_count: newRow.seat_count
    }]);
    setNewRow({
      row_number: "",
      row_type: RowType.VIP,
      seat_count: 10
    });
  };
  const removeRow = (rowNumber) => {
    setRows(rows.filter((row) => row.row_number !== rowNumber));
  };
  const formatRowType = (rowType) => {
    switch (rowType) {
      case RowType.VIP:
        return "VIP";
      default:
        return rowType.charAt(0).toUpperCase() + rowType.slice(1).toLowerCase();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      ui.toast.error("Venue name is required");
      return;
    }
    if (rows.length === 0) {
      ui.toast.error("At least one row is required");
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim() || void 0,
        rows: rows.map((row) => ({
          row_number: row.row_number,
          row_type: row.row_type,
          seat_count: row.seat_count
        }))
      });
      handleClose();
    } catch (error) {
      ui.toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    setName("");
    setAddress("");
    setRows([]);
    setNewRow({
      row_number: "",
      row_type: RowType.VIP,
      seat_count: 10
    });
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal, { open, onOpenChange: handleClose, children: /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Content, { children: /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "flex h-full flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Header, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", children: "Create New Venue" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Body, { className: "p-6 overflow-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-[720px] mx-auto", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 w-fit mx-auto", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "name", children: "Venue Name" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Input,
            {
              id: "name",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "Enter venue name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.Label, { htmlFor: "address", children: [
            "Address",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-muted txt-compact-small", children: " (Optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Textarea,
            {
              id: "address",
              value: address,
              onChange: (e) => setAddress(e.target.value),
              placeholder: "Enter venue address",
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h3", className: "mb-2", children: "Add Rows" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "row_number", children: "Row Number" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Input,
                  {
                    id: "row_number",
                    value: newRow.row_number,
                    onChange: (e) => setNewRow({ ...newRow, row_number: e.target.value }),
                    placeholder: "A, B, 1, 2..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "row_type", children: "Row Type" }),
                /* @__PURE__ */ jsxRuntime.jsxs(
                  ui.Select,
                  {
                    value: newRow.row_type,
                    onValueChange: (value) => setNewRow({ ...newRow, row_type: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
                      /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: RowType.VIP, children: "VIP" }),
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: RowType.PREMIUM, children: "Premium" }),
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: RowType.BALCONY, children: "Balcony" }),
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: RowType.STANDARD, children: "Standard" })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "seat_count", children: "Seat Count" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Input,
                  {
                    id: "seat_count",
                    type: "number",
                    min: "1",
                    value: newRow.seat_count,
                    onChange: (e) => setNewRow({ ...newRow, seat_count: parseInt(e.target.value) || 0 })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Button,
              {
                type: "button",
                variant: "secondary",
                onClick: addRow,
                disabled: !newRow.row_number.trim(),
                children: "Add Row"
              }
            )
          ] }),
          rows.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "txt-small-plus mb-2", children: "Added Rows" }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2", children: rows.map((row) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between p-2 bg-ui-bg-subtle rounded", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "txt-small", children: [
                "Row ",
                row.row_number,
                " - ",
                formatRowType(row.row_type),
                " (",
                row.seat_count,
                " seats)"
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Button,
                {
                  type: "button",
                  variant: "danger",
                  size: "small",
                  onClick: () => removeRow(row.row_number),
                  children: "Remove"
                }
              )
            ] }, row.row_number)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "my-10" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(SeatChart, { rows }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsx(
      ui.Button,
      {
        type: "submit",
        variant: "primary",
        isLoading,
        disabled: !name.trim() || rows.length === 0,
        children: "Create Venue"
      }
    ) })
  ] }) }) });
};
const columnHelper = ui.createDataTableColumnHelper();
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small-plus", children: row.original.name }),
      row.original.address && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-small text-gray-500", children: row.original.address })
    ] })
  }),
  columnHelper.accessor("rows", {
    header: "Total Capacity",
    cell: ({ row }) => {
      const totalCapacity = row.original.rows.reduce(
        (sum, rowItem) => sum + rowItem.seat_count,
        0
      );
      return /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "txt-small-plus", children: [
        totalCapacity,
        " seats"
      ] });
    }
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: ({ row }) => /* @__PURE__ */ jsxRuntime.jsx("span", { children: row.original.address || "-" })
  })
];
const VenuesPage = () => {
  const limit = 15;
  const [pagination, setPagination] = React.useState({
    pageSize: limit,
    pageIndex: 0
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const queryClient = reactQuery.useQueryClient();
  const offset = React.useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);
  const { data, isLoading } = reactQuery.useQuery({
    queryKey: ["venues", offset, limit],
    queryFn: () => sdk.client.fetch("/admin/venues", {
      query: {
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
        order: "-created_at"
      }
    })
  });
  const table = ui.useDataTable({
    columns,
    data: (data == null ? void 0 : data.venues) || [],
    rowCount: (data == null ? void 0 : data.count) || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    getRowId: (row) => row.id
  });
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleCreateVenue = async (data2) => {
    try {
      await sdk.client.fetch("/admin/venues", {
        method: "POST",
        body: data2
      });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      handleCloseModal();
    } catch (error) {
      throw new Error(`Failed to create venue: ${error.message}`);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "divide-y p-0", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable, { instance: table, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable.Toolbar, { className: "flex flex-col items-start justify-between gap-2 md:flex-row md:items-center", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: "Venues" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Button,
          {
            variant: "secondary",
            onClick: () => setIsModalOpen(true),
            children: "Create Venue"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Table, {}),
      /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Pagination, {})
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      CreateVenueModal,
      {
        open: isModalOpen,
        onOpenChange: handleCloseModal,
        onSubmit: handleCreateVenue
      }
    )
  ] });
};
const config = adminSdk.defineRouteConfig({
  label: "Venues",
  icon: icons.Buildings
});
const i18nTranslations0 = {};
const widgetModule = { widgets: [] };
const routeModule = {
  routes: [
    {
      Component: TicketProductsPage,
      path: "/ticket-products"
    },
    {
      Component: VenuesPage,
      path: "/venues"
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config$1.label,
      icon: config$1.icon,
      path: "/ticket-products",
      nested: void 0
    },
    {
      label: config.label,
      icon: config.icon,
      path: "/venues",
      nested: void 0
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: i18nTranslations0 };
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule
};
module.exports = plugin;

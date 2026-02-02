/**
 * CMS Blueprint Seed Data for freeblackmarket.com
 * Updated product architecture: No drop-shipping.
 * Aligned with mutual aid, community supply chains, and trust-based infrastructure.
 *
 * Taxonomy: Types (10 canonical) -> Categories -> Tags -> Attributes
 *
 * SYSTEM RULES:
 *   Rule 1 - Product Types = Hard Governance (don't add without mission review)
 *   Rule 2 - Categories = UX Only (change freely)
 *   Rule 3 - Collections = Enforcement (approvals, fulfillment, inventory)
 *   Rule 4 - No External Fulfillment (community-made, community-grown, community-provided, or internal digital)
 *   Rule 5 - Metadata Is Your Secret Weapon (safety, EHS, harvest dates, access rules)
 */

// ============================================================================
// TYPES - Canonical Product Types (Backend Truth Layer)
// These are the core pillars. They don't change often.
// ============================================================================
export const CMS_TYPES = [
  {
    id: "type_food",
    handle: "food",
    name: "Food",
    description: "Fresh produce, prepared foods, pantry staples, seeds, and starts from community growers and makers",
    icon: "🥬",
    display_order: 1,
    is_active: true,
  },
  {
    id: "type_land_access",
    handle: "land-access",
    name: "Land Access",
    description: "Community garden plots, farm plots, compost, soil, and shared tool access for land-based production",
    icon: "🌱",
    display_order: 2,
    is_active: true,
  },
  {
    id: "type_tools_and_infrastructure",
    handle: "tools-and-infrastructure",
    name: "Tools & Infrastructure",
    description: "Farm tools, storage, processing equipment, and physical infrastructure for community production",
    icon: "🔧",
    display_order: 3,
    is_active: true,
  },
  {
    id: "type_electronics_and_networks",
    handle: "electronics-and-networks",
    name: "Electronics & Networks",
    description: "Energy systems, mesh networking, communications equipment, and community tech infrastructure",
    icon: "📡",
    display_order: 4,
    is_active: true,
  },
  {
    id: "type_digital_services",
    handle: "digital-services",
    name: "Digital Services",
    description: "Software, network access, digital training, and internal digital service offerings",
    icon: "💻",
    display_order: 5,
    is_active: true,
  },
  {
    id: "type_community_and_events",
    handle: "community-and-events",
    name: "Community & Events",
    description: "Events, shared spaces, skill shares, workshops, and community gathering opportunities",
    icon: "🤝",
    display_order: 6,
    is_active: true,
  },
  {
    id: "type_mutual_aid",
    handle: "mutual-aid",
    name: "Mutual Aid",
    description: "Essentials, care kits, emergency support, and community-funded aid distributed through trust networks",
    icon: "🤲",
    display_order: 7,
    is_active: true,
  },
  {
    id: "type_circular_economy",
    handle: "circular-economy",
    name: "Circular Economy",
    description: "Repaired goods, salvaged materials, and second-life electronics kept in community circulation",
    icon: "♻️",
    display_order: 8,
    is_active: true,
  },
  {
    id: "type_membership",
    handle: "membership",
    name: "Membership",
    description: "Cooperative access, governance participation, and membership-gated community resources",
    icon: "🏛️",
    display_order: 9,
    is_active: true,
  },
  {
    id: "type_experimental",
    handle: "experimental",
    name: "Experimental",
    description: "Prototype devices, pilot farming projects, and experimental initiatives requiring governance approval",
    icon: "🧪",
    display_order: 10,
    is_active: true,
  },
]

// ============================================================================
// CATEGORIES - User Browsing Layer
// Categories are flexible and customer-facing. Change freely.
// ============================================================================
export const CMS_CATEGORIES = [
  // --- Food Categories ---
  {
    id: "cat_fresh_produce",
    type_id: "type_food",
    handle: "fresh-produce",
    name: "Fresh Produce",
    description: "Locally grown fruits, vegetables, and herbs from community farms and gardens",
    icon: "🥕",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_prepared_foods",
    type_id: "type_food",
    handle: "prepared-foods",
    name: "Prepared Foods",
    description: "Community-made meals, baked goods, preserves, and ready-to-eat items",
    icon: "🍲",
    display_order: 2,
    is_active: true,
  },
  {
    id: "cat_pantry_staples",
    type_id: "type_food",
    handle: "pantry-staples",
    name: "Pantry Staples",
    description: "Dry goods, grains, legumes, oils, and other shelf-stable essentials",
    icon: "🫙",
    display_order: 3,
    is_active: true,
  },
  {
    id: "cat_seeds_starts",
    type_id: "type_food",
    handle: "seeds-starts",
    name: "Seeds & Starts",
    description: "Heirloom seeds, seedlings, plant starts, and growing supplies",
    icon: "🌾",
    display_order: 4,
    is_active: true,
  },

  // --- Land & Growth Categories ---
  {
    id: "cat_community_garden_plots",
    type_id: "type_land_access",
    handle: "community-garden-plots",
    name: "Community Garden Plots",
    description: "Shared garden spaces in community-managed growing areas",
    icon: "🌿",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_farm_plots",
    type_id: "type_land_access",
    handle: "farm-plots",
    name: "Farm Plots",
    description: "Larger agricultural plots for dedicated food production",
    icon: "🚜",
    display_order: 2,
    is_active: true,
  },
  {
    id: "cat_compost_soil",
    type_id: "type_land_access",
    handle: "compost-soil",
    name: "Compost & Soil",
    description: "Community compost programs, soil amendments, and growing media",
    icon: "🪴",
    display_order: 3,
    is_active: true,
  },
  {
    id: "cat_tool_access",
    type_id: "type_land_access",
    handle: "tool-access",
    name: "Tool Access",
    description: "Shared tool libraries and equipment checkout for land-based work",
    icon: "🔑",
    display_order: 4,
    is_active: true,
  },

  // --- Tools & Infrastructure Categories ---
  {
    id: "cat_farm_tools",
    type_id: "type_tools_and_infrastructure",
    handle: "farm-tools",
    name: "Farm Tools",
    description: "Hand tools, power tools, and implements for agricultural production",
    icon: "⛏️",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_storage_processing",
    type_id: "type_tools_and_infrastructure",
    handle: "storage-processing",
    name: "Storage & Processing",
    description: "Cold storage, processing equipment, canning supplies, and preservation tools",
    icon: "🏭",
    display_order: 2,
    is_active: true,
  },

  // --- Electronics & Networks Categories ---
  {
    id: "cat_energy_systems",
    type_id: "type_electronics_and_networks",
    handle: "energy-systems",
    name: "Energy Systems",
    description: "Solar panels, batteries, charge controllers, and off-grid power infrastructure",
    icon: "⚡",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_mesh_comms",
    type_id: "type_electronics_and_networks",
    handle: "mesh-comms",
    name: "Mesh & Comms",
    description: "Mesh networking nodes, radios, community internet infrastructure, and communication tools",
    icon: "📡",
    display_order: 2,
    is_active: true,
  },

  // --- Community & Events Categories ---
  {
    id: "cat_events",
    type_id: "type_community_and_events",
    handle: "events",
    name: "Events",
    description: "Community gatherings, workshops, harvest festivals, and educational events",
    icon: "📅",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_shared_spaces",
    type_id: "type_community_and_events",
    handle: "shared-spaces",
    name: "Shared Spaces",
    description: "Community kitchens, meeting rooms, maker spaces, and shared facilities",
    icon: "🏠",
    display_order: 2,
    is_active: true,
  },
  {
    id: "cat_skill_shares",
    type_id: "type_community_and_events",
    handle: "skill-shares",
    name: "Skill Shares",
    description: "Knowledge exchange, mentorship, hands-on training, and peer education",
    icon: "📚",
    display_order: 3,
    is_active: true,
  },

  // --- Mutual Aid Categories ---
  {
    id: "cat_essentials",
    type_id: "type_mutual_aid",
    handle: "essentials",
    name: "Essentials",
    description: "Basic necessities: hygiene products, clothing, household items distributed through mutual aid",
    icon: "📦",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_care_kits",
    type_id: "type_mutual_aid",
    handle: "care-kits",
    name: "Care Kits",
    description: "Pre-assembled care packages for specific needs: wellness, winter, baby, and emergency kits",
    icon: "🎁",
    display_order: 2,
    is_active: true,
  },
  {
    id: "cat_emergency_support",
    type_id: "type_mutual_aid",
    handle: "emergency-support",
    name: "Emergency Support",
    description: "Rapid-response supplies, disaster relief items, and crisis support resources",
    icon: "🚨",
    display_order: 3,
    is_active: true,
  },

  // --- Circular Economy Categories ---
  {
    id: "cat_repaired_goods",
    type_id: "type_circular_economy",
    handle: "repaired-goods",
    name: "Repaired Goods",
    description: "Community-repaired appliances, tools, and equipment restored to working condition",
    icon: "🔧",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_salvaged_materials",
    type_id: "type_circular_economy",
    handle: "salvaged-materials",
    name: "Salvaged Materials",
    description: "Reclaimed lumber, building materials, parts, and reusable components",
    icon: "🪵",
    display_order: 2,
    is_active: true,
  },
  {
    id: "cat_second_life_electronics",
    type_id: "type_circular_economy",
    handle: "second-life-electronics",
    name: "Second-Life Electronics",
    description: "Refurbished computers, phones, radios, and electronic equipment",
    icon: "🖥️",
    display_order: 3,
    is_active: true,
  },

  // --- Membership Categories ---
  {
    id: "cat_cooperative_access",
    type_id: "type_membership",
    handle: "cooperative-access",
    name: "Cooperative Access",
    description: "Membership in food cooperatives, buying clubs, and shared-resource cooperatives",
    icon: "🏛️",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_governance_access",
    type_id: "type_membership",
    handle: "governance-access",
    name: "Governance Access",
    description: "Voting rights, proposal submission, and governance participation in community organizations",
    icon: "🗳️",
    display_order: 2,
    is_active: true,
  },

  // --- Experimental Categories ---
  {
    id: "cat_prototype_devices",
    type_id: "type_experimental",
    handle: "prototype-devices",
    name: "Prototype Devices",
    description: "Community-designed hardware prototypes, sensors, and custom-built devices",
    icon: "🧪",
    display_order: 1,
    is_active: true,
  },
  {
    id: "cat_pilot_farming_projects",
    type_id: "type_experimental",
    handle: "pilot-farming-projects",
    name: "Pilot Farming Projects",
    description: "Experimental growing techniques, new crop trials, and innovative farming methods",
    icon: "🌱",
    display_order: 2,
    is_active: true,
  },
]

// ============================================================================
// TAGS - Labels/filters for products and services
// ============================================================================
export const CMS_TAGS = [
  // --- Dietary Tags ---
  { id: "tag_organic", handle: "organic", name: "Organic", tag_type: "dietary", color: "#22c55e" },
  { id: "tag_vegan", handle: "vegan", name: "Vegan", tag_type: "dietary", color: "#16a34a" },
  { id: "tag_gluten_free", handle: "gluten-free", name: "Gluten-Free", tag_type: "dietary", color: "#eab308" },
  { id: "tag_keto", handle: "keto", name: "Keto", tag_type: "dietary", color: "#f97316" },
  { id: "tag_low_sugar", handle: "low-sugar", name: "Low-Sugar", tag_type: "dietary", color: "#06b6d4" },

  // --- Availability Tags ---
  { id: "tag_in_stock", handle: "in-stock", name: "In-stock", tag_type: "availability", color: "#22c55e" },
  { id: "tag_pre_order", handle: "pre-order", name: "Pre-order", tag_type: "availability", color: "#3b82f6" },
  { id: "tag_seasonal", handle: "seasonal", name: "Seasonal", tag_type: "availability", color: "#f59e0b" },
  { id: "tag_ready_to_eat", handle: "ready-to-eat", name: "Ready-to-eat", tag_type: "availability", color: "#10b981" },
  { id: "tag_pilot", handle: "pilot", name: "Pilot", tag_type: "availability", color: "#a855f7" },

  // --- Source Tags ---
  { id: "tag_community_grown", handle: "community-grown", name: "Community-Grown", tag_type: "source", color: "#22c55e" },
  { id: "tag_community_made", handle: "community-made", name: "Community-Made", tag_type: "source", color: "#16a34a" },
  { id: "tag_farm", handle: "farm", name: "Farm", tag_type: "source", color: "#84cc16" },
  { id: "tag_artisan", handle: "artisan", name: "Artisan", tag_type: "source", color: "#a855f7" },
  { id: "tag_nonprofit", handle: "nonprofit", name: "Nonprofit", tag_type: "source", color: "#ec4899" },
  { id: "tag_maker", handle: "maker", name: "Maker", tag_type: "source", color: "#8b5cf6" },
  { id: "tag_locally_made", handle: "locally-made", name: "Locally-made", tag_type: "source", color: "#14b8a6" },
  { id: "tag_salvaged", handle: "salvaged", name: "Salvaged", tag_type: "source", color: "#78716c" },
  { id: "tag_recyclable", handle: "recyclable", name: "Recyclable", tag_type: "source", color: "#22d3ee" },
  { id: "tag_eco_friendly", handle: "eco-friendly", name: "Eco-Friendly", tag_type: "source", color: "#34d399" },

  // --- Fulfillment Tags ---
  { id: "tag_delivery", handle: "delivery", name: "Delivery", tag_type: "fulfillment", color: "#3b82f6" },
  { id: "tag_pickup", handle: "pickup", name: "Pickup", tag_type: "fulfillment", color: "#6366f1" },
  { id: "tag_local_only", handle: "local-only", name: "Local Only", tag_type: "fulfillment", color: "#0ea5e9" },
  { id: "tag_manual_fulfillment", handle: "manual-fulfillment", name: "Manual Fulfillment", tag_type: "fulfillment", color: "#f97316" },
  { id: "tag_digital_delivery", handle: "digital-delivery", name: "Digital Delivery", tag_type: "fulfillment", color: "#8b5cf6" },

  // --- Pricing Tags ---
  { id: "tag_bulk_sale", handle: "bulk-sale", name: "Bulk Sale", tag_type: "pricing", color: "#f97316" },
  { id: "tag_fair_trade", handle: "fair-trade", name: "Fair Trade", tag_type: "pricing", color: "#22d3ee" },
  { id: "tag_mutual_aid_funded", handle: "mutual-aid-funded", name: "Mutual Aid Funded", tag_type: "pricing", color: "#ec4899" },
  { id: "tag_sliding_scale", handle: "sliding-scale", name: "Sliding Scale", tag_type: "pricing", color: "#f43f5e" },
  { id: "tag_free", handle: "free", name: "Free", tag_type: "pricing", color: "#22c55e" },

  // --- Organization Tags ---
  { id: "tag_volunteer_needed", handle: "volunteer-needed", name: "Volunteer-needed", tag_type: "organization", color: "#ef4444" },
  { id: "tag_donation", handle: "donation", name: "Donation", tag_type: "organization", color: "#f43f5e" },
  { id: "tag_open", handle: "open", name: "Open", tag_type: "organization", color: "#22c55e" },
  { id: "tag_membership", handle: "membership", name: "Membership", tag_type: "organization", color: "#6366f1" },
  { id: "tag_cooperative", handle: "cooperative", name: "Cooperative", tag_type: "organization", color: "#3b82f6" },
  { id: "tag_requires_approval", handle: "requires-approval", name: "Requires Approval", tag_type: "organization", color: "#ef4444" },
  { id: "tag_governance_required", handle: "governance-required", name: "Governance Required", tag_type: "organization", color: "#dc2626" },
  { id: "tag_ehs_restricted", handle: "ehs-restricted", name: "EHS Restricted", tag_type: "organization", color: "#b91c1c" },

  // --- Location Tags ---
  { id: "tag_city", handle: "city", name: "City", tag_type: "location", color: "#64748b" },
  { id: "tag_neighborhood", handle: "neighborhood", name: "Neighborhood", tag_type: "location", color: "#78716c" },
  { id: "tag_region", handle: "region", name: "Region", tag_type: "location", color: "#71717a" },

  // --- Service Tags ---
  { id: "tag_on_demand", handle: "on-demand", name: "On-demand", tag_type: "service", color: "#f43f5e" },
  { id: "tag_scheduled", handle: "scheduled", name: "Scheduled", tag_type: "service", color: "#6366f1" },
  { id: "tag_reservation_required", handle: "reservation-required", name: "Reservation Required", tag_type: "service", color: "#f97316" },

  // --- Condition Tags ---
  { id: "tag_new", handle: "new", name: "New", tag_type: "condition", color: "#22c55e" },
  { id: "tag_used", handle: "used", name: "Used", tag_type: "condition", color: "#f59e0b" },
  { id: "tag_refurbished", handle: "refurbished", name: "Refurbished", tag_type: "condition", color: "#3b82f6" },
  { id: "tag_repaired", handle: "repaired", name: "Repaired", tag_type: "condition", color: "#0ea5e9" },

  // --- Portion Tags ---
  { id: "tag_single", handle: "single", name: "Single", tag_type: "portion", color: "#94a3b8" },
  { id: "tag_family", handle: "family", name: "Family", tag_type: "portion", color: "#64748b" },
  { id: "tag_bulk", handle: "bulk", name: "Bulk", tag_type: "portion", color: "#475569" },
]

// ============================================================================
// ATTRIBUTES - Product/service attribute definitions
// ============================================================================
export const CMS_ATTRIBUTES = [
  // --- Common Product Attributes ---
  {
    id: "attr_price",
    handle: "price",
    name: "Price",
    description: "Product or service price",
    input_type: "number",
    display_type: "range_slider",
    unit: "$",
    validation: { min: 0 },
    is_filterable: true,
    is_required: true,
    display_order: 1,
  },
  {
    id: "attr_quantity_weight",
    handle: "quantity-weight",
    name: "Quantity / Weight",
    description: "Product quantity or weight",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 2,
  },
  {
    id: "attr_quantity_volume",
    handle: "quantity-volume",
    name: "Quantity / Volume",
    description: "Product quantity or volume",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 3,
  },
  {
    id: "attr_quantity_units",
    handle: "quantity-units",
    name: "Quantity / Units",
    description: "Number of units in package",
    input_type: "number",
    display_type: "number_input",
    unit: "units",
    validation: { min: 1 },
    is_filterable: true,
    is_required: false,
    display_order: 4,
  },

  // --- Freshness & Expiration ---
  {
    id: "attr_freshness",
    handle: "freshness",
    name: "Freshness",
    description: "Product freshness state",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Fresh", "Frozen", "Canned", "Dried", "Preserved"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 5,
  },
  {
    id: "attr_expiration_date",
    handle: "expiration-date",
    name: "Expiration Date",
    description: "Product expiration or best-by date",
    input_type: "date",
    display_type: "date_picker",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 6,
  },
  {
    id: "attr_harvest_date",
    handle: "harvest-date",
    name: "Harvest Date",
    description: "Date the product was harvested or produced",
    input_type: "date",
    display_type: "date_picker",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 7,
  },

  // --- Delivery & Fulfillment ---
  {
    id: "attr_delivery_radius",
    handle: "delivery-radius",
    name: "Delivery Radius",
    description: "Maximum delivery distance",
    input_type: "number",
    display_type: "range_slider",
    unit: "miles",
    validation: { min: 0, max: 100 },
    is_filterable: true,
    is_required: false,
    display_order: 8,
  },
  {
    id: "attr_pickup_availability",
    handle: "pickup-availability",
    name: "Pickup Availability",
    description: "Whether pickup is available",
    input_type: "boolean",
    display_type: "checkbox",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 9,
  },
  {
    id: "attr_delivery_options",
    handle: "delivery-options",
    name: "Delivery / Pickup Options",
    description: "Available fulfillment options (community-internal only)",
    input_type: "multiselect",
    display_type: "multiselect",
    unit: null,
    options: ["Local Delivery", "Pickup", "Community Drop-off"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 10,
  },

  // --- Land Access Attributes ---
  {
    id: "attr_plot_size",
    handle: "plot-size",
    name: "Plot Size",
    description: "Size of the land plot or garden space",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 11,
  },
  {
    id: "attr_access_type",
    handle: "access-type",
    name: "Access Type",
    description: "Type of access available",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Public", "Member-only", "Reservation-based", "Seasonal"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 12,
  },
  {
    id: "attr_available_resources",
    handle: "available-resources",
    name: "Available Resources",
    description: "Resources available at the location",
    input_type: "multiselect",
    display_type: "multiselect",
    unit: null,
    options: ["Land Plots", "Tools", "Seeds", "Water", "Compost", "Storage", "Electricity"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 13,
  },

  // --- Community / Events Attributes ---
  {
    id: "attr_event_date",
    handle: "event-date",
    name: "Event Date",
    description: "When the event or gathering takes place",
    input_type: "datetime",
    display_type: "date_picker",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 14,
  },
  {
    id: "attr_capacity",
    handle: "capacity",
    name: "Capacity",
    description: "Maximum number of participants or attendees",
    input_type: "number",
    display_type: "number_input",
    unit: "people",
    validation: { min: 1 },
    is_filterable: true,
    is_required: false,
    display_order: 15,
  },
  {
    id: "attr_scheduling",
    handle: "scheduling",
    name: "Scheduling",
    description: "Available days and hours",
    input_type: "json",
    display_type: "tags",
    unit: null,
    validation: null,
    is_filterable: false,
    is_required: false,
    display_order: 16,
  },
  {
    id: "attr_contact_info",
    handle: "contact-info",
    name: "Contact Info",
    description: "Contact information for the organizer or provider",
    input_type: "json",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: false,
    is_required: false,
    display_order: 17,
  },
  {
    id: "attr_hours_operation",
    handle: "hours-operation",
    name: "Hours of Operation",
    description: "Operating hours for spaces and facilities",
    input_type: "json",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: false,
    is_required: false,
    display_order: 18,
  },

  // --- Mutual Aid Attributes ---
  {
    id: "attr_need_level",
    handle: "need-level",
    name: "Need Level",
    description: "Priority/urgency level for mutual aid items",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Low", "Medium", "High", "Critical"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 19,
  },
  {
    id: "attr_funded_by",
    handle: "funded-by",
    name: "Funded By",
    description: "Source of funding for mutual aid items",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: false,
    is_required: false,
    display_order: 20,
  },

  // --- Circular Economy Attributes ---
  {
    id: "attr_condition_grade",
    handle: "condition-grade",
    name: "Condition Grade",
    description: "Quality grade for repaired/salvaged items",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Like New", "Good", "Fair", "Parts Only"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 21,
  },
  {
    id: "attr_repair_history",
    handle: "repair-history",
    name: "Repair History",
    description: "Description of repairs performed",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: false,
    is_required: false,
    display_order: 22,
  },
  {
    id: "attr_original_manufacturer",
    handle: "original-manufacturer",
    name: "Original Manufacturer",
    description: "Original manufacturer of the item",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 23,
  },

  // --- Membership Attributes ---
  {
    id: "attr_term_length",
    handle: "term-length",
    name: "Term Length",
    description: "Duration of membership access",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Monthly", "Quarterly", "Annual", "Lifetime"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 24,
  },
  {
    id: "attr_governance_level",
    handle: "governance-level",
    name: "Governance Level",
    description: "Level of governance participation included",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Observer", "Voting Member", "Board Eligible", "Full Governance"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 25,
  },

  // --- Experimental Attributes ---
  {
    id: "attr_approval_status",
    handle: "approval-status",
    name: "Approval Status",
    description: "Governance approval status for experimental items",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Pending Review", "Approved", "Conditional", "Rejected"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 26,
  },
  {
    id: "attr_pilot_phase",
    handle: "pilot-phase",
    name: "Pilot Phase",
    description: "Current phase of the experimental project",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Concept", "Prototype", "Testing", "Limited Release"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 27,
  },
  {
    id: "attr_safety_certification",
    handle: "safety-certification",
    name: "Safety Certification",
    description: "Safety certifications or EHS compliance status",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 28,
  },

  // --- Equipment / Tools Attributes ---
  {
    id: "attr_size_weight",
    handle: "size-weight",
    name: "Size / Weight",
    description: "Physical dimensions or weight",
    input_type: "text",
    display_type: "text_input",
    unit: null,
    validation: null,
    is_filterable: false,
    is_required: false,
    display_order: 29,
  },
  {
    id: "attr_power_source",
    handle: "power-source",
    name: "Power Source",
    description: "Power source for equipment and devices",
    input_type: "select",
    display_type: "dropdown",
    unit: null,
    options: ["Manual", "Battery", "Solar", "AC Power", "DC Power", "Hybrid"],
    validation: null,
    is_filterable: true,
    is_required: false,
    display_order: 30,
  },
]

// ============================================================================
// CATEGORY-TAG MAPPINGS - Which tags apply to each category
// ============================================================================
export const CMS_CATEGORY_TAG_MAPPINGS = [
  // --- Food: Fresh Produce ---
  { category_id: "cat_fresh_produce", tag_id: "tag_organic" },
  { category_id: "cat_fresh_produce", tag_id: "tag_vegan" },
  { category_id: "cat_fresh_produce", tag_id: "tag_in_stock" },
  { category_id: "cat_fresh_produce", tag_id: "tag_seasonal" },
  { category_id: "cat_fresh_produce", tag_id: "tag_pre_order" },
  { category_id: "cat_fresh_produce", tag_id: "tag_community_grown" },
  { category_id: "cat_fresh_produce", tag_id: "tag_farm" },
  { category_id: "cat_fresh_produce", tag_id: "tag_delivery" },
  { category_id: "cat_fresh_produce", tag_id: "tag_pickup" },
  { category_id: "cat_fresh_produce", tag_id: "tag_local_only" },
  { category_id: "cat_fresh_produce", tag_id: "tag_bulk_sale" },
  { category_id: "cat_fresh_produce", tag_id: "tag_fair_trade" },
  { category_id: "cat_fresh_produce", tag_id: "tag_single" },
  { category_id: "cat_fresh_produce", tag_id: "tag_family" },
  { category_id: "cat_fresh_produce", tag_id: "tag_bulk" },

  // --- Food: Prepared Foods ---
  { category_id: "cat_prepared_foods", tag_id: "tag_vegan" },
  { category_id: "cat_prepared_foods", tag_id: "tag_gluten_free" },
  { category_id: "cat_prepared_foods", tag_id: "tag_keto" },
  { category_id: "cat_prepared_foods", tag_id: "tag_low_sugar" },
  { category_id: "cat_prepared_foods", tag_id: "tag_ready_to_eat" },
  { category_id: "cat_prepared_foods", tag_id: "tag_community_made" },
  { category_id: "cat_prepared_foods", tag_id: "tag_locally_made" },
  { category_id: "cat_prepared_foods", tag_id: "tag_delivery" },
  { category_id: "cat_prepared_foods", tag_id: "tag_pickup" },
  { category_id: "cat_prepared_foods", tag_id: "tag_single" },
  { category_id: "cat_prepared_foods", tag_id: "tag_family" },
  { category_id: "cat_prepared_foods", tag_id: "tag_bulk" },

  // --- Food: Pantry Staples ---
  { category_id: "cat_pantry_staples", tag_id: "tag_organic" },
  { category_id: "cat_pantry_staples", tag_id: "tag_vegan" },
  { category_id: "cat_pantry_staples", tag_id: "tag_gluten_free" },
  { category_id: "cat_pantry_staples", tag_id: "tag_in_stock" },
  { category_id: "cat_pantry_staples", tag_id: "tag_community_made" },
  { category_id: "cat_pantry_staples", tag_id: "tag_fair_trade" },
  { category_id: "cat_pantry_staples", tag_id: "tag_delivery" },
  { category_id: "cat_pantry_staples", tag_id: "tag_pickup" },
  { category_id: "cat_pantry_staples", tag_id: "tag_bulk_sale" },
  { category_id: "cat_pantry_staples", tag_id: "tag_eco_friendly" },

  // --- Food: Seeds & Starts ---
  { category_id: "cat_seeds_starts", tag_id: "tag_organic" },
  { category_id: "cat_seeds_starts", tag_id: "tag_seasonal" },
  { category_id: "cat_seeds_starts", tag_id: "tag_pre_order" },
  { category_id: "cat_seeds_starts", tag_id: "tag_community_grown" },
  { category_id: "cat_seeds_starts", tag_id: "tag_farm" },
  { category_id: "cat_seeds_starts", tag_id: "tag_delivery" },
  { category_id: "cat_seeds_starts", tag_id: "tag_pickup" },
  { category_id: "cat_seeds_starts", tag_id: "tag_local_only" },

  // --- Land & Growth: Community Garden Plots ---
  { category_id: "cat_community_garden_plots", tag_id: "tag_open" },
  { category_id: "cat_community_garden_plots", tag_id: "tag_membership" },
  { category_id: "cat_community_garden_plots", tag_id: "tag_reservation_required" },
  { category_id: "cat_community_garden_plots", tag_id: "tag_seasonal" },
  { category_id: "cat_community_garden_plots", tag_id: "tag_volunteer_needed" },
  { category_id: "cat_community_garden_plots", tag_id: "tag_neighborhood" },
  { category_id: "cat_community_garden_plots", tag_id: "tag_city" },

  // --- Land & Growth: Farm Plots ---
  { category_id: "cat_farm_plots", tag_id: "tag_membership" },
  { category_id: "cat_farm_plots", tag_id: "tag_reservation_required" },
  { category_id: "cat_farm_plots", tag_id: "tag_seasonal" },
  { category_id: "cat_farm_plots", tag_id: "tag_cooperative" },
  { category_id: "cat_farm_plots", tag_id: "tag_region" },

  // --- Land & Growth: Compost & Soil ---
  { category_id: "cat_compost_soil", tag_id: "tag_community_grown" },
  { category_id: "cat_compost_soil", tag_id: "tag_eco_friendly" },
  { category_id: "cat_compost_soil", tag_id: "tag_in_stock" },
  { category_id: "cat_compost_soil", tag_id: "tag_pickup" },
  { category_id: "cat_compost_soil", tag_id: "tag_delivery" },
  { category_id: "cat_compost_soil", tag_id: "tag_bulk_sale" },

  // --- Land & Growth: Tool Access ---
  { category_id: "cat_tool_access", tag_id: "tag_reservation_required" },
  { category_id: "cat_tool_access", tag_id: "tag_membership" },
  { category_id: "cat_tool_access", tag_id: "tag_on_demand" },
  { category_id: "cat_tool_access", tag_id: "tag_scheduled" },
  { category_id: "cat_tool_access", tag_id: "tag_neighborhood" },

  // --- Tools & Infrastructure: Farm Tools ---
  { category_id: "cat_farm_tools", tag_id: "tag_community_made" },
  { category_id: "cat_farm_tools", tag_id: "tag_maker" },
  { category_id: "cat_farm_tools", tag_id: "tag_new" },
  { category_id: "cat_farm_tools", tag_id: "tag_used" },
  { category_id: "cat_farm_tools", tag_id: "tag_refurbished" },
  { category_id: "cat_farm_tools", tag_id: "tag_in_stock" },
  { category_id: "cat_farm_tools", tag_id: "tag_pickup" },
  { category_id: "cat_farm_tools", tag_id: "tag_delivery" },

  // --- Tools & Infrastructure: Storage & Processing ---
  { category_id: "cat_storage_processing", tag_id: "tag_community_made" },
  { category_id: "cat_storage_processing", tag_id: "tag_maker" },
  { category_id: "cat_storage_processing", tag_id: "tag_new" },
  { category_id: "cat_storage_processing", tag_id: "tag_used" },
  { category_id: "cat_storage_processing", tag_id: "tag_refurbished" },
  { category_id: "cat_storage_processing", tag_id: "tag_in_stock" },
  { category_id: "cat_storage_processing", tag_id: "tag_pickup" },

  // --- Electronics & Networks: Energy Systems ---
  { category_id: "cat_energy_systems", tag_id: "tag_community_made" },
  { category_id: "cat_energy_systems", tag_id: "tag_maker" },
  { category_id: "cat_energy_systems", tag_id: "tag_new" },
  { category_id: "cat_energy_systems", tag_id: "tag_refurbished" },
  { category_id: "cat_energy_systems", tag_id: "tag_in_stock" },
  { category_id: "cat_energy_systems", tag_id: "tag_pre_order" },
  { category_id: "cat_energy_systems", tag_id: "tag_eco_friendly" },
  { category_id: "cat_energy_systems", tag_id: "tag_requires_approval" },

  // --- Electronics & Networks: Mesh & Comms ---
  { category_id: "cat_mesh_comms", tag_id: "tag_community_made" },
  { category_id: "cat_mesh_comms", tag_id: "tag_maker" },
  { category_id: "cat_mesh_comms", tag_id: "tag_new" },
  { category_id: "cat_mesh_comms", tag_id: "tag_refurbished" },
  { category_id: "cat_mesh_comms", tag_id: "tag_in_stock" },
  { category_id: "cat_mesh_comms", tag_id: "tag_pre_order" },
  { category_id: "cat_mesh_comms", tag_id: "tag_requires_approval" },

  // --- Community & Events: Events ---
  { category_id: "cat_events", tag_id: "tag_open" },
  { category_id: "cat_events", tag_id: "tag_membership" },
  { category_id: "cat_events", tag_id: "tag_volunteer_needed" },
  { category_id: "cat_events", tag_id: "tag_free" },
  { category_id: "cat_events", tag_id: "tag_scheduled" },
  { category_id: "cat_events", tag_id: "tag_city" },
  { category_id: "cat_events", tag_id: "tag_neighborhood" },

  // --- Community & Events: Shared Spaces ---
  { category_id: "cat_shared_spaces", tag_id: "tag_reservation_required" },
  { category_id: "cat_shared_spaces", tag_id: "tag_membership" },
  { category_id: "cat_shared_spaces", tag_id: "tag_open" },
  { category_id: "cat_shared_spaces", tag_id: "tag_scheduled" },
  { category_id: "cat_shared_spaces", tag_id: "tag_cooperative" },
  { category_id: "cat_shared_spaces", tag_id: "tag_neighborhood" },

  // --- Community & Events: Skill Shares ---
  { category_id: "cat_skill_shares", tag_id: "tag_open" },
  { category_id: "cat_skill_shares", tag_id: "tag_free" },
  { category_id: "cat_skill_shares", tag_id: "tag_scheduled" },
  { category_id: "cat_skill_shares", tag_id: "tag_volunteer_needed" },
  { category_id: "cat_skill_shares", tag_id: "tag_community_made" },

  // --- Mutual Aid: Essentials ---
  { category_id: "cat_essentials", tag_id: "tag_mutual_aid_funded" },
  { category_id: "cat_essentials", tag_id: "tag_free" },
  { category_id: "cat_essentials", tag_id: "tag_sliding_scale" },
  { category_id: "cat_essentials", tag_id: "tag_delivery" },
  { category_id: "cat_essentials", tag_id: "tag_pickup" },
  { category_id: "cat_essentials", tag_id: "tag_manual_fulfillment" },
  { category_id: "cat_essentials", tag_id: "tag_donation" },

  // --- Mutual Aid: Care Kits ---
  { category_id: "cat_care_kits", tag_id: "tag_mutual_aid_funded" },
  { category_id: "cat_care_kits", tag_id: "tag_free" },
  { category_id: "cat_care_kits", tag_id: "tag_community_made" },
  { category_id: "cat_care_kits", tag_id: "tag_delivery" },
  { category_id: "cat_care_kits", tag_id: "tag_pickup" },
  { category_id: "cat_care_kits", tag_id: "tag_manual_fulfillment" },

  // --- Mutual Aid: Emergency Support ---
  { category_id: "cat_emergency_support", tag_id: "tag_mutual_aid_funded" },
  { category_id: "cat_emergency_support", tag_id: "tag_free" },
  { category_id: "cat_emergency_support", tag_id: "tag_manual_fulfillment" },
  { category_id: "cat_emergency_support", tag_id: "tag_delivery" },
  { category_id: "cat_emergency_support", tag_id: "tag_on_demand" },
  { category_id: "cat_emergency_support", tag_id: "tag_donation" },

  // --- Circular Economy: Repaired Goods ---
  { category_id: "cat_repaired_goods", tag_id: "tag_repaired" },
  { category_id: "cat_repaired_goods", tag_id: "tag_refurbished" },
  { category_id: "cat_repaired_goods", tag_id: "tag_community_made" },
  { category_id: "cat_repaired_goods", tag_id: "tag_eco_friendly" },
  { category_id: "cat_repaired_goods", tag_id: "tag_in_stock" },
  { category_id: "cat_repaired_goods", tag_id: "tag_pickup" },
  { category_id: "cat_repaired_goods", tag_id: "tag_delivery" },
  { category_id: "cat_repaired_goods", tag_id: "tag_sliding_scale" },

  // --- Circular Economy: Salvaged Materials ---
  { category_id: "cat_salvaged_materials", tag_id: "tag_salvaged" },
  { category_id: "cat_salvaged_materials", tag_id: "tag_recyclable" },
  { category_id: "cat_salvaged_materials", tag_id: "tag_eco_friendly" },
  { category_id: "cat_salvaged_materials", tag_id: "tag_in_stock" },
  { category_id: "cat_salvaged_materials", tag_id: "tag_pickup" },
  { category_id: "cat_salvaged_materials", tag_id: "tag_bulk_sale" },

  // --- Circular Economy: Second-Life Electronics ---
  { category_id: "cat_second_life_electronics", tag_id: "tag_refurbished" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_repaired" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_used" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_community_made" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_eco_friendly" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_in_stock" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_pickup" },
  { category_id: "cat_second_life_electronics", tag_id: "tag_delivery" },

  // --- Memberships: Cooperative Access ---
  { category_id: "cat_cooperative_access", tag_id: "tag_cooperative" },
  { category_id: "cat_cooperative_access", tag_id: "tag_membership" },
  { category_id: "cat_cooperative_access", tag_id: "tag_sliding_scale" },
  { category_id: "cat_cooperative_access", tag_id: "tag_digital_delivery" },

  // --- Memberships: Governance Access ---
  { category_id: "cat_governance_access", tag_id: "tag_governance_required" },
  { category_id: "cat_governance_access", tag_id: "tag_membership" },
  { category_id: "cat_governance_access", tag_id: "tag_cooperative" },
  { category_id: "cat_governance_access", tag_id: "tag_digital_delivery" },

  // --- Experimental: Prototype Devices ---
  { category_id: "cat_prototype_devices", tag_id: "tag_requires_approval" },
  { category_id: "cat_prototype_devices", tag_id: "tag_pilot" },
  { category_id: "cat_prototype_devices", tag_id: "tag_community_made" },
  { category_id: "cat_prototype_devices", tag_id: "tag_maker" },
  { category_id: "cat_prototype_devices", tag_id: "tag_ehs_restricted" },
  { category_id: "cat_prototype_devices", tag_id: "tag_pickup" },

  // --- Experimental: Pilot Farming Projects ---
  { category_id: "cat_pilot_farming_projects", tag_id: "tag_requires_approval" },
  { category_id: "cat_pilot_farming_projects", tag_id: "tag_pilot" },
  { category_id: "cat_pilot_farming_projects", tag_id: "tag_community_grown" },
  { category_id: "cat_pilot_farming_projects", tag_id: "tag_seasonal" },
  { category_id: "cat_pilot_farming_projects", tag_id: "tag_volunteer_needed" },
  { category_id: "cat_pilot_farming_projects", tag_id: "tag_governance_required" },
]

// ============================================================================
// CATEGORY-ATTRIBUTE MAPPINGS - Which attributes apply to each category
// ============================================================================
export const CMS_CATEGORY_ATTRIBUTE_MAPPINGS = [
  // --- Food: Fresh Produce ---
  { category_id: "cat_fresh_produce", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_fresh_produce", attribute_id: "attr_quantity_weight" },
  { category_id: "cat_fresh_produce", attribute_id: "attr_freshness" },
  { category_id: "cat_fresh_produce", attribute_id: "attr_harvest_date" },
  { category_id: "cat_fresh_produce", attribute_id: "attr_expiration_date" },
  { category_id: "cat_fresh_produce", attribute_id: "attr_delivery_radius" },
  { category_id: "cat_fresh_produce", attribute_id: "attr_pickup_availability" },

  // --- Food: Prepared Foods ---
  { category_id: "cat_prepared_foods", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_prepared_foods", attribute_id: "attr_freshness" },
  { category_id: "cat_prepared_foods", attribute_id: "attr_expiration_date" },
  { category_id: "cat_prepared_foods", attribute_id: "attr_delivery_options" },

  // --- Food: Pantry Staples ---
  { category_id: "cat_pantry_staples", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_pantry_staples", attribute_id: "attr_quantity_weight" },
  { category_id: "cat_pantry_staples", attribute_id: "attr_quantity_units" },
  { category_id: "cat_pantry_staples", attribute_id: "attr_expiration_date" },
  { category_id: "cat_pantry_staples", attribute_id: "attr_delivery_options" },

  // --- Food: Seeds & Starts ---
  { category_id: "cat_seeds_starts", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_seeds_starts", attribute_id: "attr_quantity_units" },
  { category_id: "cat_seeds_starts", attribute_id: "attr_harvest_date" },
  { category_id: "cat_seeds_starts", attribute_id: "attr_delivery_options" },

  // --- Land & Growth: Community Garden Plots ---
  { category_id: "cat_community_garden_plots", attribute_id: "attr_plot_size", is_required: true },
  { category_id: "cat_community_garden_plots", attribute_id: "attr_access_type" },
  { category_id: "cat_community_garden_plots", attribute_id: "attr_available_resources" },
  { category_id: "cat_community_garden_plots", attribute_id: "attr_scheduling" },
  { category_id: "cat_community_garden_plots", attribute_id: "attr_contact_info" },

  // --- Land & Growth: Farm Plots ---
  { category_id: "cat_farm_plots", attribute_id: "attr_plot_size", is_required: true },
  { category_id: "cat_farm_plots", attribute_id: "attr_access_type" },
  { category_id: "cat_farm_plots", attribute_id: "attr_available_resources" },
  { category_id: "cat_farm_plots", attribute_id: "attr_scheduling" },
  { category_id: "cat_farm_plots", attribute_id: "attr_contact_info" },

  // --- Land & Growth: Compost & Soil ---
  { category_id: "cat_compost_soil", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_compost_soil", attribute_id: "attr_quantity_weight" },
  { category_id: "cat_compost_soil", attribute_id: "attr_quantity_volume" },
  { category_id: "cat_compost_soil", attribute_id: "attr_pickup_availability" },
  { category_id: "cat_compost_soil", attribute_id: "attr_delivery_radius" },

  // --- Land & Growth: Tool Access ---
  { category_id: "cat_tool_access", attribute_id: "attr_scheduling" },
  { category_id: "cat_tool_access", attribute_id: "attr_access_type" },
  { category_id: "cat_tool_access", attribute_id: "attr_available_resources" },
  { category_id: "cat_tool_access", attribute_id: "attr_contact_info" },

  // --- Tools & Infrastructure: Farm Tools ---
  { category_id: "cat_farm_tools", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_farm_tools", attribute_id: "attr_quantity_units" },
  { category_id: "cat_farm_tools", attribute_id: "attr_size_weight" },
  { category_id: "cat_farm_tools", attribute_id: "attr_delivery_options" },

  // --- Tools & Infrastructure: Storage & Processing ---
  { category_id: "cat_storage_processing", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_storage_processing", attribute_id: "attr_size_weight" },
  { category_id: "cat_storage_processing", attribute_id: "attr_power_source" },
  { category_id: "cat_storage_processing", attribute_id: "attr_delivery_options" },

  // --- Electronics & Networks: Energy Systems ---
  { category_id: "cat_energy_systems", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_energy_systems", attribute_id: "attr_size_weight" },
  { category_id: "cat_energy_systems", attribute_id: "attr_power_source" },
  { category_id: "cat_energy_systems", attribute_id: "attr_safety_certification" },
  { category_id: "cat_energy_systems", attribute_id: "attr_delivery_options" },

  // --- Electronics & Networks: Mesh & Comms ---
  { category_id: "cat_mesh_comms", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_mesh_comms", attribute_id: "attr_size_weight" },
  { category_id: "cat_mesh_comms", attribute_id: "attr_power_source" },
  { category_id: "cat_mesh_comms", attribute_id: "attr_delivery_options" },

  // --- Community & Events: Events ---
  { category_id: "cat_events", attribute_id: "attr_event_date", is_required: true },
  { category_id: "cat_events", attribute_id: "attr_capacity" },
  { category_id: "cat_events", attribute_id: "attr_contact_info" },
  { category_id: "cat_events", attribute_id: "attr_scheduling" },

  // --- Community & Events: Shared Spaces ---
  { category_id: "cat_shared_spaces", attribute_id: "attr_capacity" },
  { category_id: "cat_shared_spaces", attribute_id: "attr_scheduling" },
  { category_id: "cat_shared_spaces", attribute_id: "attr_hours_operation" },
  { category_id: "cat_shared_spaces", attribute_id: "attr_contact_info" },
  { category_id: "cat_shared_spaces", attribute_id: "attr_available_resources" },

  // --- Community & Events: Skill Shares ---
  { category_id: "cat_skill_shares", attribute_id: "attr_event_date" },
  { category_id: "cat_skill_shares", attribute_id: "attr_capacity" },
  { category_id: "cat_skill_shares", attribute_id: "attr_contact_info" },

  // --- Mutual Aid: Essentials ---
  { category_id: "cat_essentials", attribute_id: "attr_need_level" },
  { category_id: "cat_essentials", attribute_id: "attr_funded_by" },
  { category_id: "cat_essentials", attribute_id: "attr_quantity_units" },
  { category_id: "cat_essentials", attribute_id: "attr_delivery_options" },

  // --- Mutual Aid: Care Kits ---
  { category_id: "cat_care_kits", attribute_id: "attr_need_level" },
  { category_id: "cat_care_kits", attribute_id: "attr_funded_by" },
  { category_id: "cat_care_kits", attribute_id: "attr_quantity_units" },
  { category_id: "cat_care_kits", attribute_id: "attr_delivery_options" },

  // --- Mutual Aid: Emergency Support ---
  { category_id: "cat_emergency_support", attribute_id: "attr_need_level", is_required: true },
  { category_id: "cat_emergency_support", attribute_id: "attr_funded_by" },
  { category_id: "cat_emergency_support", attribute_id: "attr_delivery_options" },
  { category_id: "cat_emergency_support", attribute_id: "attr_contact_info" },

  // --- Circular Economy: Repaired Goods ---
  { category_id: "cat_repaired_goods", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_repaired_goods", attribute_id: "attr_condition_grade", is_required: true },
  { category_id: "cat_repaired_goods", attribute_id: "attr_repair_history" },
  { category_id: "cat_repaired_goods", attribute_id: "attr_original_manufacturer" },
  { category_id: "cat_repaired_goods", attribute_id: "attr_delivery_options" },

  // --- Circular Economy: Salvaged Materials ---
  { category_id: "cat_salvaged_materials", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_salvaged_materials", attribute_id: "attr_condition_grade" },
  { category_id: "cat_salvaged_materials", attribute_id: "attr_quantity_weight" },
  { category_id: "cat_salvaged_materials", attribute_id: "attr_quantity_units" },
  { category_id: "cat_salvaged_materials", attribute_id: "attr_pickup_availability" },

  // --- Circular Economy: Second-Life Electronics ---
  { category_id: "cat_second_life_electronics", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_second_life_electronics", attribute_id: "attr_condition_grade", is_required: true },
  { category_id: "cat_second_life_electronics", attribute_id: "attr_repair_history" },
  { category_id: "cat_second_life_electronics", attribute_id: "attr_original_manufacturer" },
  { category_id: "cat_second_life_electronics", attribute_id: "attr_delivery_options" },

  // --- Memberships: Cooperative Access ---
  { category_id: "cat_cooperative_access", attribute_id: "attr_price", is_required: true },
  { category_id: "cat_cooperative_access", attribute_id: "attr_term_length", is_required: true },
  { category_id: "cat_cooperative_access", attribute_id: "attr_governance_level" },
  { category_id: "cat_cooperative_access", attribute_id: "attr_contact_info" },

  // --- Memberships: Governance Access ---
  { category_id: "cat_governance_access", attribute_id: "attr_price" },
  { category_id: "cat_governance_access", attribute_id: "attr_term_length" },
  { category_id: "cat_governance_access", attribute_id: "attr_governance_level", is_required: true },
  { category_id: "cat_governance_access", attribute_id: "attr_contact_info" },

  // --- Experimental: Prototype Devices ---
  { category_id: "cat_prototype_devices", attribute_id: "attr_price" },
  { category_id: "cat_prototype_devices", attribute_id: "attr_approval_status", is_required: true },
  { category_id: "cat_prototype_devices", attribute_id: "attr_pilot_phase" },
  { category_id: "cat_prototype_devices", attribute_id: "attr_safety_certification" },
  { category_id: "cat_prototype_devices", attribute_id: "attr_contact_info" },

  // --- Experimental: Pilot Farming Projects ---
  { category_id: "cat_pilot_farming_projects", attribute_id: "attr_approval_status", is_required: true },
  { category_id: "cat_pilot_farming_projects", attribute_id: "attr_pilot_phase" },
  { category_id: "cat_pilot_farming_projects", attribute_id: "attr_plot_size" },
  { category_id: "cat_pilot_farming_projects", attribute_id: "attr_contact_info" },
]

// ============================================================================
// COLLECTIONS - Operational Logic Layer
// Collections define how the system behaves, not what the product is.
// Powers rules: approvals, fulfillment, inventory, restrictions.
// ============================================================================
export const CMS_COLLECTIONS = [
  {
    title: "Community-Grown",
    handle: "community-grown",
    metadata: {
      auto_approval: true,
      manual_fulfillment_required: true,
      community_priority: true,
      description: "Products grown by community members in shared or personal gardens",
    },
  },
  {
    title: "Community-Made",
    handle: "community-made",
    metadata: {
      auto_approval: true,
      manual_fulfillment_required: true,
      community_priority: true,
      description: "Items crafted, prepared, or assembled by community members",
    },
  },
  {
    title: "Shared Resources",
    handle: "shared-resources",
    metadata: {
      auto_approval: false,
      manual_fulfillment_required: true,
      inventory_tracking: false,
      requires_reservation: true,
      description: "Community-shared tools, spaces, and infrastructure not individually owned",
    },
  },
  {
    title: "Mutual Aid Funded",
    handle: "mutual-aid-funded",
    metadata: {
      auto_approval: false,
      manual_fulfillment_required: true,
      tax_exempt: true,
      community_priority: true,
      description: "Items funded through community mutual aid contributions",
    },
  },
  {
    title: "Refurbished",
    handle: "refurbished",
    metadata: {
      auto_approval: true,
      manual_fulfillment_required: true,
      requires_condition_grade: true,
      description: "Repaired and restored items kept in community circulation",
    },
  },
  {
    title: "Pilot / Experimental",
    handle: "pilot-experimental",
    metadata: {
      auto_approval: false,
      requires_governance_review: true,
      manual_fulfillment_required: true,
      limited_availability: true,
      description: "Experimental products and projects requiring governance approval",
    },
  },
  {
    title: "EHS-Restricted",
    handle: "ehs-restricted",
    metadata: {
      auto_approval: false,
      requires_governance_review: true,
      requires_safety_certification: true,
      manual_fulfillment_required: true,
      description: "Items with environmental, health, or safety restrictions",
    },
  },
  {
    title: "Requires-Approval",
    handle: "requires-approval",
    metadata: {
      auto_approval: false,
      requires_governance_review: true,
      description: "Items requiring manual governance or admin approval before listing",
    },
  },
]

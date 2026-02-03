import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Vendor Types & Features | Free Black Market",
  description: "Explore the different types of community providers on Free Black Market - producers, gardens, kitchens, makers, restaurants, and mutual aid organizations. Learn about vendor and customer features.",
}

// Inline SVG icons
const SparklesIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

const ShoppingBagIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const UserGroupIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
)

const VENDOR_PANEL_URL = process.env.NEXT_PUBLIC_VENDOR_PANEL_URL || "https://vendor.freeblackmarket.com"

export default function VendorTypesPage() {
  const vendorTypes = [
    {
      type: "Producers",
      icon: "🌾",
      tagline: "Farms, Ranches & Food Producers",
      description: "Producers are the backbone of our local food system. This includes family farms, ranches, homesteads, and small-scale food producers who grow, raise, or produce food directly.",
      examples: ["Family farms", "Ranches & livestock", "Orchards & vineyards", "Beekeepers", "Mushroom growers", "Aquaponic/hydroponic growers", "Small-scale dairy", "Egg producers"],
      features: [
        "Farm story & narrative pages",
        "Growing practices certification display",
        "Regional location mapping",
        "Farm size & year established",
        "Certification badges (USDA Organic, Fair Trade, etc.)",
        "CSA & subscription box offerings",
        "Seasonal harvest tracking",
        "Community investment eligibility",
      ],
      color: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      link: "/producers",
    },
    {
      type: "Gardens",
      icon: "🌱",
      tagline: "Community Gardens & Urban Farms",
      description: "Community gardens are shared growing spaces where neighbors come together to cultivate food, build relationships, and strengthen local food security. They serve as hubs for food education and community building.",
      examples: ["Neighborhood community gardens", "Urban farms", "School gardens", "Church/faith-based gardens", "Cooperative growing spaces", "Allotment gardens", "Guerrilla gardens", "Rooftop farms"],
      features: [
        "Plot availability & management",
        "Membership management",
        "Work party scheduling",
        "Democratic governance tools",
        "Harvest tracking & ledger",
        "Soil zone management",
        "Event & workshop calendars",
        "Volunteer hour tracking",
      ],
      color: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      link: "/gardens",
    },
    {
      type: "Kitchens",
      icon: "🍳",
      tagline: "Shared-Use Commercial Kitchen Spaces",
      description: "Community kitchens provide licensed commercial kitchen space for food entrepreneurs, home cooks scaling their businesses, and community food programs. They're essential infrastructure for local food economies.",
      examples: ["Shared-use commercial kitchens", "Kitchen incubators", "Church kitchen rentals", "Restaurant off-hours rentals", "Food truck commissaries", "Co-op kitchen spaces", "Community center kitchens", "School kitchen rentals"],
      features: [
        "Hourly booking system",
        "Equipment inventory & access",
        "Station/capacity management",
        "Membership tiers & pricing",
        "Food safety compliance tracking",
        "Storage allocation",
        "Scheduling & availability calendar",
        "Insurance & certification management",
      ],
      color: "from-teal-50 to-cyan-50",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      link: "/kitchens",
    },
    {
      type: "Makers",
      icon: "🎨",
      tagline: "Artisans, Crafters & Cottage Producers",
      description: "Makers are the artists and craftspeople who create handmade goods, artisan foods, and cottage industry products. They bring creativity and unique offerings to local markets.",
      examples: ["Artisan bakers", "Jam & preserve makers", "Fermenters & kombucha brewers", "Candle & soap makers", "Potters & ceramicists", "Woodworkers", "Textile artists", "Herbalists"],
      features: [
        "Product galleries & portfolios",
        "Custom order management",
        "Cottage food compliance info",
        "Craft certifications display",
        "Limited edition & batch tracking",
        "Made-to-order capabilities",
        "Ingredient sourcing transparency",
        "Workshop & class offerings",
      ],
      color: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      link: "/vendors?type=maker",
    },
    {
      type: "Restaurants",
      icon: "🍽️",
      tagline: "Restaurants, Ghost Kitchens & Food Trucks",
      description: "Restaurants and food service businesses that want to sell directly to customers, offer meal subscriptions, or participate in community food programs. This includes ghost kitchens and food trucks.",
      examples: ["Local restaurants", "Ghost kitchens", "Food trucks", "Pop-up dining", "Catering services", "Meal prep services", "Specialty food vendors", "Food hall vendors"],
      features: [
        "Menu management",
        "Cuisine type categorization",
        "Service type options (delivery, pickup, dine-in)",
        "Operating hours & scheduling",
        "Meal subscriptions & bundles",
        "Special dietary tagging",
        "Integration with delivery services",
        "Event catering management",
      ],
      color: "from-red-50 to-orange-50",
      borderColor: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      link: "/vendors?type=restaurant",
    },
    {
      type: "Mutual Aid",
      icon: "🤝",
      tagline: "Mutual Aid Networks & Community Organizations",
      description: "Mutual aid organizations are community-driven networks focused on collective care, resource sharing, and food justice. They embody the spirit of neighbors helping neighbors without hierarchy.",
      examples: ["Food distribution networks", "Community fridges", "Meal programs", "Food pantries", "Neighborhood aid networks", "Solidarity economies", "Resource sharing collectives", "Community care networks"],
      features: [
        "Resource distribution tracking",
        "Volunteer coordination",
        "Donation management",
        "Community needs assessment",
        "Partner organization networking",
        "Impact metrics & reporting",
        "Recipient privacy protection",
        "Multi-location coordination",
      ],
      color: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      link: "/vendors?type=mutual_aid",
    },
  ]

  const vendorFeatures = [
    {
      category: "Revenue & Payments",
      icon: "💰",
      items: [
        { name: "97% Revenue Share", description: "Keep 97% of every sale, just 3% coalition fee" },
        { name: "Stripe Connect Payments", description: "Secure, fast payouts in 2-3 business days" },
        { name: "Set Your Own Prices", description: "Full control over your pricing strategy" },
        { name: "No Monthly Fees", description: "Zero subscriptions, listing fees, or hidden charges" },
        { name: "Digital Wallet", description: "Track earnings, manage funds in one place" },
      ],
    },
    {
      category: "Store Management",
      icon: "🏪",
      items: [
        { name: "Product Catalog", description: "Unlimited products with variants, images, and descriptions" },
        { name: "Inventory Management", description: "Track stock levels, get low-stock alerts" },
        { name: "Order Management", description: "Process orders, communicate with customers" },
        { name: "Vacation Mode", description: "Pause orders when you need a break" },
        { name: "Custom Policies", description: "Set your own shipping, returns, and fulfillment rules" },
      ],
    },
    {
      category: "Fulfillment Options",
      icon: "🚚",
      items: [
        { name: "Local Delivery", description: "Set delivery zones, days, and minimum orders" },
        { name: "Customer Pickup", description: "Schedule pickup times and locations" },
        { name: "Shipping", description: "Ship products nationwide with carrier integration" },
        { name: "Market Pickup", description: "Coordinate farmers market and pop-up pickups" },
        { name: "Subscription Deliveries", description: "Recurring delivery schedules for CSAs" },
      ],
    },
    {
      category: "Marketing & Visibility",
      icon: "📢",
      items: [
        { name: "Vendor Profile Pages", description: "Tell your story, showcase your values" },
        { name: "Featured Vendor Status", description: "Get highlighted on homepage and collections" },
        { name: "Review & Rating System", description: "Build trust through customer feedback" },
        { name: "Social Media Links", description: "Connect Instagram, TikTok, Facebook, and more" },
        { name: "External Store Links", description: "Link to Etsy, farmers markets, your website" },
      ],
    },
    {
      category: "Community Programs",
      icon: "🌍",
      items: [
        { name: "CSA Subscriptions", description: "Offer seasonal shares and recurring boxes" },
        { name: "Community Investment", description: "Receive direct investment from supporters" },
        { name: "Collaborative Sales", description: "Partner with other vendors on bundles" },
        { name: "Event Participation", description: "Join virtual markets and community events" },
        { name: "Coalition Governance", description: "Voting rights on platform decisions" },
      ],
    },
    {
      category: "Verification & Trust",
      icon: "✅",
      items: [
        { name: "Verification Badges", description: "Display verified status to build trust" },
        { name: "Certification Display", description: "Show USDA Organic, Fair Trade, and more" },
        { name: "Growing Practices", description: "Highlight organic, regenerative, biodynamic methods" },
        { name: "Location Transparency", description: "Show your region and growing area" },
        { name: "Business Registration", description: "Display licenses and tax information" },
      ],
    },
  ]

  const customerFeatures = [
    {
      category: "Discovery & Shopping",
      icon: "🔍",
      items: [
        { name: "Browse by Vendor Type", description: "Shop producers, gardens, kitchens, makers, restaurants, mutual aid" },
        { name: "Location-Based Search", description: "Find vendors within 10, 25, 50, 100, or 250 miles" },
        { name: "Category Navigation", description: "Browse by product type, collection, or seasonal items" },
        { name: "Vendor Profiles", description: "Learn about vendors, their story, and practices" },
        { name: "Search & Filters", description: "Find exactly what you're looking for quickly" },
      ],
    },
    {
      category: "Transparency & Trust",
      icon: "👁️",
      items: [
        { name: "Know Your Producer", description: "See who made your food and where it comes from" },
        { name: "Pricing Transparency", description: "97% goes to creator, 3% to coalition - always" },
        { name: "Certification Visibility", description: "See organic, fair trade, and other certifications" },
        { name: "Growing Practices", description: "Understand how your food was produced" },
        { name: "Reviews & Ratings", description: "Read authentic customer experiences" },
      ],
    },
    {
      category: "Account & Orders",
      icon: "📦",
      items: [
        { name: "Order Tracking", description: "Track your orders from purchase to delivery" },
        { name: "Order History", description: "View past purchases and reorder favorites" },
        { name: "Address Management", description: "Save multiple delivery addresses" },
        { name: "Wishlist", description: "Save products to purchase later" },
        { name: "Digital Downloads", description: "Access digital products instantly" },
      ],
    },
    {
      category: "Communication",
      icon: "💬",
      items: [
        { name: "Direct Messaging", description: "Message vendors directly about orders or questions" },
        { name: "Order Updates", description: "Receive notifications about your order status" },
        { name: "Community Feed", description: "Stay updated on vendor news and seasonal offerings" },
        { name: "Review System", description: "Share your experience to help others" },
        { name: "Newsletter", description: "Get updates about new vendors and products" },
      ],
    },
    {
      category: "Subscriptions & Programs",
      icon: "📅",
      items: [
        { name: "CSA Memberships", description: "Subscribe to seasonal produce boxes" },
        { name: "Standing Orders", description: "Set up recurring orders for essentials" },
        { name: "Community Investment", description: "Invest in local producers, earn returns" },
        { name: "Garden Memberships", description: "Join community gardens, reserve plots" },
        { name: "Kitchen Bookings", description: "Book shared kitchen time for your projects" },
      ],
    },
    {
      category: "Payment & Security",
      icon: "🔒",
      items: [
        { name: "Secure Checkout", description: "Industry-standard payment security" },
        { name: "Buyer Protection", description: "Payment held until delivery confirmed" },
        { name: "Multiple Payment Methods", description: "Credit cards, digital wallets, and more" },
        { name: "Digital Wallet", description: "Track purchases, investments, and credits" },
        { name: "Easy Refunds", description: "Simple process when things don't work out" },
      ],
    },
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-800 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Vendor Types & Platform Features
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-4xl mx-auto mb-8">
            Free Black Market connects communities with local producers, makers, and food infrastructure.
            We support six types of community providers, each with specialized features to help them thrive.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/vendors"
              className="px-8 py-4 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              Browse All Vendors
            </Link>
            <Link
              href="/sell"
              className="px-8 py-4 bg-green-700 text-white font-semibold rounded-lg border-2 border-green-500 hover:bg-green-600 transition-colors"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Scope Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What is Free Black Market?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A community-owned marketplace that puts people over profit, built on radical transparency
              and fair compensation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-green-600">97%</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">To Creators</h3>
              <p className="text-gray-600">
                Ninety-seven cents of every dollar goes directly to the people who did the work.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-blue-600">3%</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coalition Fee</h3>
              <p className="text-gray-600">
                Just 3% covers everything: platform, payments, development, and community programs.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-purple-600">$0</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hidden Fees</h3>
              <p className="text-gray-600">
                No subscriptions, no listing fees, no payment processing fees. That's the whole story.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Our Mission</h3>
            <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
              We believe in building local food economies where producers keep what they earn,
              customers know where their food comes from, and communities have access to the
              infrastructure they need to feed themselves. We're not venture-backed—we're
              community-owned. When creators succeed, we all succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Vendor Types Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <UserGroupIcon className="w-5 h-5" />
              Six Vendor Types
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Providers We Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From farms to mutual aid networks, we've built specialized tools for every type
              of community food provider.
            </p>
          </div>

          <div className="space-y-8">
            {vendorTypes.map((vendor) => (
              <div
                key={vendor.type}
                className={`bg-gradient-to-br ${vendor.color} rounded-2xl p-8 border ${vendor.borderColor}`}
              >
                <div className="lg:flex lg:gap-8">
                  <div className="lg:w-2/3 mb-6 lg:mb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-full ${vendor.iconBg} flex items-center justify-center`}>
                        <span className="text-3xl">{vendor.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{vendor.type}</h3>
                        <p className={`${vendor.iconColor} font-medium`}>{vendor.tagline}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-6">{vendor.description}</p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Examples include:</h4>
                      <div className="flex flex-wrap gap-2">
                        {vendor.examples.map((example) => (
                          <span
                            key={example}
                            className="px-3 py-1 bg-white/60 rounded-full text-sm text-gray-700"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={vendor.link}
                      className={`inline-flex items-center gap-2 px-6 py-3 ${vendor.iconBg} ${vendor.iconColor} font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                    >
                      Browse {vendor.type}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="lg:w-1/3">
                    <div className="bg-white/70 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Specialized Features</h4>
                      <ul className="space-y-2">
                        {vendor.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Features Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 text-green-200 rounded-full text-sm font-medium mb-4">
              <SparklesIcon className="w-5 h-5" />
              For Vendors
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vendor Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to run your business, connect with customers, and grow your community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorFeatures.map((category) => (
              <div key={category.category} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg font-semibold">{category.category}</h3>
                </div>
                <ul className="space-y-3">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <div className="font-medium text-green-400">{item.name}</div>
                      <div className="text-sm text-gray-400">{item.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href={`${VENDOR_PANEL_URL}/register`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-400 transition-colors"
            >
              Get Started Today
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <ShoppingBagIcon className="w-5 h-5" />
              For Customers
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Customer Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Shop with purpose, know your producers, and support your local food economy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerFeatures.map((category) => (
              <div key={category.category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                </div>
                <ul className="space-y-3">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Start Shopping
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore by Vendor Type
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Jump directly to the vendors you're looking for.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {vendorTypes.map((vendor) => (
              <Link
                key={vendor.type}
                href={vendor.link}
                className={`bg-gradient-to-br ${vendor.color} rounded-xl p-6 text-center border ${vendor.borderColor} hover:shadow-lg transition-shadow`}
              >
                <span className="text-4xl block mb-2">{vendor.icon}</span>
                <h3 className="font-semibold text-gray-900">{vendor.type}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Whether you're here to provide or to shop, you're joining a movement to build
            a fairer, more transparent food economy.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/categories"
              className="px-8 py-4 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              Shop Local Producers
            </Link>
            <Link
              href="/sell"
              className="px-8 py-4 bg-green-700 text-white font-semibold rounded-lg border-2 border-green-500 hover:bg-green-600 transition-colors"
            >
              Become a Vendor
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/how-it-works"
              className="text-green-200 hover:text-white underline"
            >
              Learn more about how Free Black Market works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

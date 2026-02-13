import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

type CommunityResource = {
  title: string
  description: string
  href: string
  cta: string
  emoji: string
}

const communityResources: CommunityResource[] = [
  {
    title: "Collective Buys",
    description:
      "Join open group-buy campaigns, pool community demand, and unlock better pricing for essentials.",
    href: "/collective/demand-pools",
    cta: "Browse collective buys",
    emoji: "🤝",
  },
  {
    title: "Community Gardens",
    description:
      "Explore local gardens, support seasonal projects, and connect with shared growing spaces.",
    href: "/gardens",
    cta: "Discover gardens",
    emoji: "🌱",
  },
  {
    title: "Community Kitchens",
    description:
      "Find shared-use kitchens for cooking, food entrepreneurship, and local meal initiatives.",
    href: "/kitchens",
    cta: "Find kitchens",
    emoji: "🍲",
  },
  {
    title: "Mutual Aid",
    description:
      "Connect with neighborhood care networks and community-led resource-sharing organizations.",
    href: "/vendor-types",
    cta: "View mutual aid networks",
    emoji: "🫶",
  },
  {
    title: "Food Banks",
    description:
      "Locate food pantries and food-bank style support providers across the community marketplace.",
    href: "/vendor-types",
    cta: "Explore food support providers",
    emoji: "🥫",
  },
]

export const metadata: Metadata = {
  title: "Community Resources | BMC Marketplace",
  description:
    "Browse collective buys, community gardens, kitchens, mutual aid networks, and food support resources in one place.",
}

export default function CommunityResourcesPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold">Community Resources</h1>
        <p className="mt-3 text-sm text-ui-fg-subtle md:text-base">
          Find local support systems in one place. Use this hub to quickly access collective buys,
          gardens, kitchens, mutual aid networks, and food support services.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {communityResources.map((resource) => (
            <article key={resource.title} className="rounded-md border bg-ui-bg-base p-5">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <span aria-hidden>{resource.emoji}</span>
                {resource.title}
              </h2>
              <p className="mt-2 text-sm text-ui-fg-subtle">{resource.description}</p>
              <LocalizedClientLink href={resource.href} className="mt-4 inline-block text-sm font-medium underline">
                {resource.cta}
              </LocalizedClientLink>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

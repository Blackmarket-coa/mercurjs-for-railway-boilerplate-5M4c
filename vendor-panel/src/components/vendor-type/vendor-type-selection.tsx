import { Button, Heading, Text } from "@medusajs/ui"
import { VendorTypeCard, VendorTypeOption } from "./vendor-type-card"
import { VendorType } from "../../providers/vendor-type-provider"

/**
 * Icons for each vendor type
 */
const ProducerIcon = () => (
  <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const GardenIcon = () => (
  <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const MakerIcon = () => (
  <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const RestaurantIcon = () => (
  <svg className="w-6 h-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MutualAidIcon = () => (
  <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

/**
 * Vendor type options with metadata
 */
export const vendorTypeOptions: VendorTypeOption[] = [
  {
    type: "producer",
    title: "Producer",
    description: "Farms, ranches, food producers growing and selling directly",
    icon: <ProducerIcon />,
    color: "bg-green-100",
  },
  {
    type: "garden",
    title: "Community Garden",
    description: "Urban farms, co-ops, and community growing spaces",
    icon: <GardenIcon />,
    color: "bg-emerald-100",
  },
  {
    type: "maker",
    title: "Maker",
    description: "Artisans, crafters, cottage food producers, bakers",
    icon: <MakerIcon />,
    color: "bg-amber-100",
  },
  {
    type: "restaurant",
    title: "Restaurant",
    description: "Restaurants, food trucks, ghost kitchens, caterers",
    icon: <RestaurantIcon />,
    color: "bg-orange-100",
  },
  {
    type: "mutual_aid",
    title: "Mutual Aid",
    description: "Community organizations, food banks, support networks",
    icon: <MutualAidIcon />,
    color: "bg-purple-100",
  },
]

interface VendorTypeSelectionProps {
  selectedType: VendorType | null
  onSelect: (type: VendorType) => void
  onContinue: () => void
}

export function VendorTypeSelection({ 
  selectedType, 
  onSelect, 
  onContinue 
}: VendorTypeSelectionProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <Heading level="h1" className="text-center mb-2">
        What type of vendor are you?
      </Heading>
      <Text size="small" className="text-ui-fg-subtle text-center mb-6">
        Select the option that best describes your business. This helps us customize your experience.
      </Text>
      
      {/* Type cards grid */}
      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {vendorTypeOptions.slice(0, 4).map((option) => (
          <VendorTypeCard
            key={option.type}
            option={option}
            selected={selectedType === option.type}
            onSelect={onSelect}
          />
        ))}
      </div>
      
      {/* Mutual Aid - full width since it's solo */}
      <div className="w-full mb-6">
        <VendorTypeCard
          option={vendorTypeOptions[4]}
          selected={selectedType === "mutual_aid"}
          onSelect={onSelect}
        />
      </div>
      
      {/* Continue button */}
      <Button 
        className="w-full"
        disabled={!selectedType}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  )
}

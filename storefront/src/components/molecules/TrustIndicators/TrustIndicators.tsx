"use client"

import { useState } from "react"

// Inline SVG Icons to avoid external dependency
const ShieldCheckIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
)

const CheckBadgeIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
)

const MapPinIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
)

const SparklesIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
  </svg>
)

const HeartIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
)

const UserGroupIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
  </svg>
)

const GlobeAltIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
  </svg>
)

const StarIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
)

const InformationCircleIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
)

/**
 * Badge Types matching the backend
 */
export type BadgeType =
  | "VERIFIED_PRODUCER"
  | "LOCAL_PRODUCER"
  | "ORGANIC_CERTIFIED"
  | "REGENERATIVE"
  | "FAIR_TRADE"
  | "WOMAN_OWNED"
  | "BLACK_OWNED"
  | "VETERAN_OWNED"
  | "COOPERATIVE"
  | "FAMILY_FARM"
  | "B_CORP"
  | "ZERO_WASTE"
  | "CARBON_NEUTRAL"
  | "COMMUNITY_SUPPORTED"

/**
 * Verification Level matching the backend
 */
export type VerificationLevel =
  | "UNVERIFIED"
  | "SELF_REPORTED"
  | "VERIFIED"
  | "AUDITED"
  | "CERTIFIED"

/**
 * Badge configuration with display info
 */
const BADGE_CONFIG: Record<
  BadgeType,
  { name: string; description: string; icon: typeof ShieldCheckIcon; color: string }
> = {
  VERIFIED_PRODUCER: {
    name: "Verified Producer",
    description: "This producer's identity and location have been verified by our team.",
    icon: ShieldCheckIcon,
    color: "#10B981",
  },
  LOCAL_PRODUCER: {
    name: "Local Producer",
    description: "Located within 100 miles of your delivery area.",
    icon: MapPinIcon,
    color: "#3B82F6",
  },
  ORGANIC_CERTIFIED: {
    name: "Certified Organic",
    description: "USDA Certified Organic - verified by an accredited certifier.",
    icon: CheckBadgeIcon,
    color: "#22C55E",
  },
  REGENERATIVE: {
    name: "Regenerative",
    description: "Uses regenerative agriculture practices that improve soil health.",
    icon: SparklesIcon,
    color: "#8B5CF6",
  },
  FAIR_TRADE: {
    name: "Fair Trade",
    description: "Fair Trade certified - workers receive fair wages and conditions.",
    icon: CheckBadgeIcon,
    color: "#F59E0B",
  },
  WOMAN_OWNED: {
    name: "Woman-Owned",
    description: "Majority woman-owned business.",
    icon: UserGroupIcon,
    color: "#EC4899",
  },
  BLACK_OWNED: {
    name: "Black-Owned",
    description: "Majority Black-owned business.",
    icon: UserGroupIcon,
    color: "#1F2937",
  },
  VETERAN_OWNED: {
    name: "Veteran-Owned",
    description: "Owned by a U.S. military veteran.",
    icon: StarIcon,
    color: "#DC2626",
  },
  COOPERATIVE: {
    name: "Cooperative",
    description: "Democratically-owned cooperative business.",
    icon: UserGroupIcon,
    color: "#0891B2",
  },
  FAMILY_FARM: {
    name: "Family Farm",
    description: "Family-owned and operated for at least one generation.",
    icon: HeartIcon,
    color: "#78716C",
  },
  B_CORP: {
    name: "B Corp Certified",
    description: "Meets the highest standards of social and environmental performance.",
    icon: CheckBadgeIcon,
    color: "#1D4ED8",
  },
  ZERO_WASTE: {
    name: "Zero Waste",
    description: "Committed to zero waste practices in production and packaging.",
    icon: GlobeAltIcon,
    color: "#059669",
  },
  CARBON_NEUTRAL: {
    name: "Carbon Neutral",
    description: "Operations are carbon neutral or carbon negative.",
    icon: GlobeAltIcon,
    color: "#0D9488",
  },
  COMMUNITY_SUPPORTED: {
    name: "Community Supported",
    description: "Offers CSA or community-supported purchasing options.",
    icon: HeartIcon,
    color: "#E11D48",
  },
}

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  UNVERIFIED: { label: "New Producer", color: "#6B7280" },
  SELF_REPORTED: { label: "Self-Reported", color: "#F59E0B" },
  VERIFIED: { label: "Verified", color: "#10B981" },
  AUDITED: { label: "Audited", color: "#3B82F6" },
  CERTIFIED: { label: "Certified", color: "#8B5CF6" },
}

interface TrustBadgeProps {
  badgeType: BadgeType
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

/**
 * Single Trust Badge with tooltip
 */
export const TrustBadge = ({ badgeType, size = "md", showTooltip = true }: TrustBadgeProps) => {
  const [showInfo, setShowInfo] = useState(false)
  const config = BADGE_CONFIG[badgeType]
  
  if (!config) return null
  
  const Icon = config.icon
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => showTooltip && setShowInfo(!showInfo)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        title={config.name}
        aria-label={config.name}
      >
        <Icon className={sizeClasses[size]} style={{ color: config.color }} />
      </button>
      
      {showInfo && showTooltip && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowInfo(false)}
          />
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" style={{ color: config.color }} />
              <span className="font-semibold text-gray-900">{config.name}</span>
            </div>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </>
      )}
    </div>
  )
}

interface VerificationBadgeProps {
  level: VerificationLevel
  trustScore?: number
  showScore?: boolean
}

/**
 * Verification Level Badge
 */
export const VerificationBadge = ({ level, trustScore, showScore = false }: VerificationBadgeProps) => {
  const [showInfo, setShowInfo] = useState(false)
  const config = VERIFICATION_LABELS[level]
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-colors hover:opacity-80"
        style={{ 
          backgroundColor: `${config.color}15`,
          color: config.color,
        }}
      >
        <ShieldCheckIcon className="w-4 h-4" />
        <span>{config.label}</span>
        {showScore && trustScore !== undefined && (
          <span className="text-xs opacity-75">({trustScore}%)</span>
        )}
      </button>
      
      {showInfo && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowInfo(false)}
          />
          <div className="absolute z-50 top-full left-0 mt-2 w-72 p-4 bg-white rounded-lg shadow-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">What does this mean?</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {level === "UNVERIFIED" && (
                <p>This is a new producer who hasn't completed our verification process yet.</p>
              )}
              {level === "SELF_REPORTED" && (
                <p>This producer has submitted their information but it hasn't been independently verified.</p>
              )}
              {level === "VERIFIED" && (
                <p>We've verified this producer's identity, location, and basic business information.</p>
              )}
              {level === "AUDITED" && (
                <p>This producer has undergone an audit of their practices and operations.</p>
              )}
              {level === "CERTIFIED" && (
                <p>This producer holds recognized third-party certifications that we've verified.</p>
              )}
              
              {trustScore !== undefined && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <span>Trust Score</span>
                    <span className="font-semibold">{trustScore}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${trustScore}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface TrustIndicatorsProps {
  verificationLevel: VerificationLevel
  trustScore?: number
  badges: BadgeType[]
  yearsActive?: number
  productionScale?: string
  className?: string
}

/**
 * Full Trust Indicators Component
 * Shows verification level and all badges
 */
export const TrustIndicators = ({
  verificationLevel,
  trustScore,
  badges,
  yearsActive,
  productionScale,
  className = "",
}: TrustIndicatorsProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Verification Level - Primary Trust Indicator */}
      <div className="flex items-center justify-between">
        <VerificationBadge level={verificationLevel} trustScore={trustScore} showScore />
        {yearsActive !== undefined && yearsActive > 0 && (
          <span className="text-sm text-gray-500">
            {yearsActive} {yearsActive === 1 ? "year" : "years"} on platform
          </span>
        )}
      </div>
      
      {/* Trust Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {badges.map((badge) => (
            <TrustBadge key={badge} badgeType={badge} size="md" />
          ))}
        </div>
      )}
      
      {/* Production Scale */}
      {productionScale && (
        <p className="text-sm text-gray-500">
          {productionScale === "HOME_BASED" && "Home-based production"}
          {productionScale === "SMALL" && "Small-scale producer (1-5 people)"}
          {productionScale === "MEDIUM" && "Medium-scale producer (6-25 people)"}
          {productionScale === "LARGE" && "Large-scale producer (26+ people)"}
        </p>
      )}
    </div>
  )
}

interface DisputePolicyTooltipProps {
  policy?: string
}

/**
 * "What happens if something goes wrong?" tooltip
 */
export const DisputePolicyTooltip = ({ policy }: DisputePolicyTooltipProps) => {
  const [showPolicy, setShowPolicy] = useState(false)
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowPolicy(!showPolicy)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <InformationCircleIcon className="w-4 h-4" />
        <span>What happens if something goes wrong?</span>
      </button>
      
      {showPolicy && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowPolicy(false)}
          />
          <div className="absolute z-50 top-full left-0 mt-2 w-80 p-4 bg-white rounded-lg shadow-lg border">
            <h4 className="font-semibold text-gray-900 mb-3">Our Protection Promise</h4>
            {policy ? (
              <p className="text-sm text-gray-600">{policy}</p>
            ) : (
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">If your order doesn't arrive:</strong>{" "}
                  We'll work with the producer to resolve it or issue a full refund.
                </p>
                <p>
                  <strong className="text-gray-900">If something is damaged or wrong:</strong>{" "}
                  Contact us within 48 hours with photos and we'll make it right.
                </p>
                <p>
                  <strong className="text-gray-900">Payment protection:</strong>{" "}
                  Your payment is held securely until delivery is confirmed.
                </p>
              </div>
            )}
            <p className="mt-3 pt-3 border-t text-xs text-gray-500">
              We step in to protect both buyers and producers.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default TrustIndicators

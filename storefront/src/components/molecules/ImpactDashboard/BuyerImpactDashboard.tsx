"use client"

import { useState } from "react"

// Inline SVG Icons
const CurrencyDollarIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UserGroupIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
)

const TruckIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const ShoppingBagIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const CalendarDaysIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
)

const ShareIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
)

const TrophyIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  </svg>
)

const StarIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

const HeartIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
)

const ArrowPathIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

const SparklesIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

const MapPinIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const CheckBadgeIcon = ({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
)

/**
 * Buyer Badge Types
 */
export type BuyerBadgeType =
  | "FIRST_PURCHASE"
  | "LOCAL_SUPPORTER"
  | "CO_OP_BUYER"
  | "REGENERATIVE_PATRON"
  | "SUBSCRIPTION_SUPPORTER"
  | "COMMUNITY_CHAMPION"
  | "PRODUCER_PARTNER"
  | "LOYAL_CUSTOMER"
  | "IMPACT_LEADER"
  | "REFERRAL_STAR"

interface BuyerBadge {
  type: BuyerBadgeType
  name: string
  description: string
  icon: typeof TrophyIcon
  color: string
  earnedAt?: Date
}

const BUYER_BADGE_CONFIG: Record<BuyerBadgeType, Omit<BuyerBadge, "type" | "earnedAt">> = {
  FIRST_PURCHASE: {
    name: "First Purchase",
    description: "Welcome! You've made your first purchase directly from a producer.",
    icon: ShoppingBagIcon,
    color: "#10B981",
  },
  LOCAL_SUPPORTER: {
    name: "Local Supporter",
    description: "You've made 5+ purchases from local producers.",
    icon: MapPinIcon,
    color: "#3B82F6",
  },
  CO_OP_BUYER: {
    name: "Co-op Buyer",
    description: "You're part of a cooperative buying group.",
    icon: UserGroupIcon,
    color: "#8B5CF6",
  },
  REGENERATIVE_PATRON: {
    name: "Regenerative Patron",
    description: "You've supported farms using regenerative practices.",
    icon: SparklesIcon,
    color: "#22C55E",
  },
  SUBSCRIPTION_SUPPORTER: {
    name: "Subscription Supporter",
    description: "You have an active subscription with a producer.",
    icon: ArrowPathIcon,
    color: "#F59E0B",
  },
  COMMUNITY_CHAMPION: {
    name: "Community Champion",
    description: "You've sent $500+ directly to producers!",
    icon: StarIcon,
    color: "#EC4899",
  },
  PRODUCER_PARTNER: {
    name: "Producer Partner",
    description: "You've sent $1,000+ directly to producers!",
    icon: TrophyIcon,
    color: "#EAB308",
  },
  LOYAL_CUSTOMER: {
    name: "Loyal Customer",
    description: "You've been supporting producers for 12+ months.",
    icon: CalendarDaysIcon,
    color: "#6366F1",
  },
  IMPACT_LEADER: {
    name: "Impact Leader",
    description: "You're in the top 10% of supporters by impact.",
    icon: CheckBadgeIcon,
    color: "#DC2626",
  },
  REFERRAL_STAR: {
    name: "Referral Star",
    description: "You've referred 5+ new customers to the platform.",
    icon: ShareIcon,
    color: "#0891B2",
  },
}

interface ImpactStats {
  dollarsToProducers: number
  producersSupported: number
  milesSaved: number
  totalOrders: number
  monthsActive: number
  badges: Array<{
    type: BuyerBadgeType
    earnedAt?: Date
  }>
}

interface BuyerImpactDashboardProps {
  stats: ImpactStats
  customerName?: string
  className?: string
}

/**
 * Buyer Impact Dashboard
 * 
 * "The UI must let users *see themselves* in the purchase."
 * Shows the customer's total impact across all purchases.
 */
export const BuyerImpactDashboard = ({
  stats,
  customerName,
  className = "",
}: BuyerImpactDashboardProps) => {
  const [showShareModal, setShowShareModal] = useState(false)
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>
          {customerName && (
            <p className="text-gray-500">
              {customerName}, here's the difference you've made
            </p>
          )}
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          Share Impact
        </button>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CurrencyDollarIcon}
          label="Sent to Producers"
          value={`$${stats.dollarsToProducers.toLocaleString()}`}
          color="#10B981"
          description="Direct support to people who grow & make"
        />
        <StatCard
          icon={UserGroupIcon}
          label="Producers Supported"
          value={stats.producersSupported.toString()}
          color="#3B82F6"
          description="Unique farms & makers you've purchased from"
        />
        <StatCard
          icon={TruckIcon}
          label="Food Miles Saved"
          value={stats.milesSaved.toLocaleString()}
          color="#F59E0B"
          description="Estimated vs. typical grocery supply chain"
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Orders"
          value={stats.totalOrders.toString()}
          color="#8B5CF6"
          description={`Over ${stats.monthsActive} months`}
        />
      </div>
      
      {/* Badges Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h3>
        
        {stats.badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.badges.map((badge) => {
              const config = BUYER_BADGE_CONFIG[badge.type]
              return (
                <BadgeCard
                  key={badge.type}
                  name={config.name}
                  description={config.description}
                  icon={config.icon}
                  color={config.color}
                  earnedAt={badge.earnedAt}
                  earned={true}
                />
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            Make your first purchase to earn badges!
          </p>
        )}
        
        {/* Locked badges */}
        {stats.badges.length < Object.keys(BUYER_BADGE_CONFIG).length && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Badges to Earn</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(BUYER_BADGE_CONFIG)
                .filter(([type]) => !stats.badges.some(b => b.type === type))
                .slice(0, 5)
                .map(([type, config]) => (
                  <BadgeCard
                    key={type}
                    name={config.name}
                    description={config.description}
                    icon={config.icon}
                    color={config.color}
                    earned={false}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareImpactModal
          stats={stats}
          customerName={customerName}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  icon: typeof CurrencyDollarIcon
  label: string
  value: string
  color: string
  description?: string
}

const StatCard = ({ icon: Icon, label, value, color, description }: StatCardProps) => (
  <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {description && (
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    )}
  </div>
)

interface BadgeCardProps {
  name: string
  description: string
  icon: typeof TrophyIcon
  color: string
  earned: boolean
  earnedAt?: Date
}

const BadgeCard = ({ name, description, icon: Icon, color, earned, earnedAt }: BadgeCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className={`w-full p-3 rounded-lg border text-center transition-all ${
          earned 
            ? "bg-white hover:shadow-md" 
            : "bg-gray-50 opacity-50"
        }`}
      >
        <div
          className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2"
          style={{ 
            backgroundColor: earned ? `${color}15` : "#E5E7EB",
          }}
        >
          <Icon 
            className="w-5 h-5" 
            style={{ color: earned ? color : "#9CA3AF" }} 
          />
        </div>
        <p className={`text-xs font-medium ${earned ? "text-gray-900" : "text-gray-400"}`}>
          {name}
        </p>
      </button>
      
      {showTooltip && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowTooltip(false)}
          />
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-lg border">
            <p className="font-medium text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
            {earned && earnedAt && (
              <p className="text-xs text-green-600 mt-2">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
            {!earned && (
              <p className="text-xs text-gray-400 mt-2">Not yet earned</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

interface ShareImpactModalProps {
  stats: ImpactStats
  customerName?: string
  onClose: () => void
}

const ShareImpactModal = ({ stats, customerName, onClose }: ShareImpactModalProps) => {
  const shareText = `I've sent $${stats.dollarsToProducers.toLocaleString()} directly to ${stats.producersSupported} producers on @freeblackmarket! 🌱 Skip the middleman, support real producers. #BuyDirect #LocalFood`
  
  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    )
  }
  
  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`,
      "_blank"
    )
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
    // Could add toast notification here
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Impact</h3>
          
          {/* Impact Card Preview */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white mb-6">
            <p className="text-sm opacity-90">My impact on freeblackmarket.com</p>
            <p className="text-3xl font-bold mt-2">
              ${stats.dollarsToProducers.toLocaleString()}
            </p>
            <p className="text-sm opacity-90">sent to {stats.producersSupported} producers</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span>{stats.milesSaved.toLocaleString()} food miles saved</span>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="space-y-3">
            <button
              onClick={shareToTwitter}
              className="w-full py-3 px-4 bg-[#1DA1F2] text-white rounded-lg font-medium hover:bg-[#1a8cd8] transition-colors"
            >
              Share on X (Twitter)
            </button>
            <button
              onClick={shareToFacebook}
              className="w-full py-3 px-4 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166fe5] transition-colors"
            >
              Share on Facebook
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Impact Receipt Component
 * Shown after checkout
 */
interface ImpactReceiptProps {
  orderTotal: number
  producerAmount: number
  producerName?: string
  foodMiles?: number
  isRepeatOrder?: boolean
  cumulativeStats?: {
    totalToProducers: number
    producersSupported: number
  }
  className?: string
}

export const ImpactReceipt = ({
  orderTotal,
  producerAmount,
  producerName,
  foodMiles = 50,
  isRepeatOrder = false,
  cumulativeStats,
  className = "",
}: ImpactReceiptProps) => {
  const producerPercent = Math.round((producerAmount / orderTotal) * 100)
  const milesSaved = Math.max(0, 1500 - foodMiles) // vs 1500 avg grocery miles
  
  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <HeartIcon className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">
          Thank You for Your Impact!
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Main impact */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">This order</p>
          <p className="text-2xl font-bold text-green-600">
            ${(producerAmount / 100).toFixed(2)}
          </p>
          <p className="text-gray-700">
            sent directly to {producerName || "the producer"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            That's {producerPercent}% of your purchase
          </p>
        </div>
        
        {/* Environmental impact */}
        <div className="flex items-center gap-3 text-sm">
          <TruckIcon className="w-5 h-5 text-green-600" />
          <span className="text-gray-700">
            ~{milesSaved.toLocaleString()} food miles saved vs grocery store
          </span>
        </div>
        
        {/* Repeat customer callout */}
        {isRepeatOrder && (
          <div className="flex items-center gap-3 text-sm bg-green-100 rounded-lg p-3">
            <ArrowPathIcon className="w-5 h-5 text-green-600" />
            <span className="text-green-800">
              You're a repeat supporter - producers love customers like you!
            </span>
          </div>
        )}
        
        {/* Cumulative impact */}
        {cumulativeStats && (
          <div className="pt-4 border-t border-green-200">
            <p className="text-sm text-gray-500 mb-2">Your total impact</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total to producers</span>
              <span className="font-semibold text-green-600">
                ${cumulativeStats.totalToProducers.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-700">Producers supported</span>
              <span className="font-semibold text-green-600">
                {cumulativeStats.producersSupported}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyerImpactDashboard

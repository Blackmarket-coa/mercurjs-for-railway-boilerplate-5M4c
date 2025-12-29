"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  MapPin, 
  Calendar, 
  Leaf, 
  Award, 
  Globe, 
  ChevronLeft,
  ExternalLink,
  ShoppingBag,
  Sun,
  Droplets,
} from "lucide-react"

// Growing practice labels and icons
const PRACTICE_INFO: Record<string, { label: string; icon: typeof Leaf; color: string }> = {
  ORGANIC: { label: "Organic", icon: Leaf, color: "green" },
  CERTIFIED_ORGANIC: { label: "Certified Organic", icon: Award, color: "green" },
  REGENERATIVE: { label: "Regenerative", icon: Sun, color: "amber" },
  CONVENTIONAL: { label: "Conventional", icon: Leaf, color: "gray" },
  BIODYNAMIC: { label: "Biodynamic", icon: Sun, color: "purple" },
  PERMACULTURE: { label: "Permaculture", icon: Leaf, color: "emerald" },
  HYDROPONIC: { label: "Hydroponic", icon: Droplets, color: "blue" },
  AQUAPONIC: { label: "Aquaponic", icon: Droplets, color: "cyan" },
  NO_SPRAY: { label: "No Spray", icon: Leaf, color: "lime" },
  IPM: { label: "Integrated Pest Management", icon: Leaf, color: "teal" },
}

const SEASON_LABELS: Record<string, string> = {
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
  WINTER: "Winter",
  YEAR_ROUND: "Year Round",
}

interface Harvest {
  id: string
  crop_name: string
  variety?: string
  harvest_date?: string
  season?: string
  year?: number
  growing_method?: string
  photo?: string
}

interface Product {
  id: string
  title: string
  handle: string
  thumbnail?: string
  status: string
}

interface Producer {
  id: string
  name: string
  handle: string
  description?: string
  region?: string
  state?: string
  country_code?: string
  latitude?: number
  longitude?: number
  farm_size_acres?: number
  year_established?: number
  practices?: string[]
  certifications?: Array<{ name: string; issuer?: string }>
  story?: string
  photo?: string
  cover_image?: string
  gallery?: string[]
  website?: string
  social_links?: Record<string, string>
  featured?: boolean
  verified?: boolean
  harvests?: Harvest[]
  products?: Product[]
}

interface ProducerDetailPageProps {
  handle: string
  locale: string
}

export function ProducerDetailPage({ handle, locale }: ProducerDetailPageProps) {
  const [producer, setProducer] = useState<Producer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"story" | "harvests" | "products">("story")

  useEffect(() => {
    async function fetchProducer() {
      try {
        const response = await fetch(`/api/producers/${handle}`)
        if (!response.ok) {
          throw new Error("Producer not found")
        }
        const data = await response.json()
        setProducer(data.producer)
      } catch (err) {
        setError("Could not load producer information")
      } finally {
        setLoading(false)
      }
    }

    fetchProducer()
  }, [handle])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (error || !producer) {
    return (
      <div className="text-center py-16">
        <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Producer Not Found</h2>
        <p className="text-gray-600 mb-4">{error || "This producer profile doesn't exist."}</p>
        <Link
          href="/producers"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all producers
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back Link */}
      <Link
        href="/producers"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        All Producers
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        {producer.cover_image ? (
          <div className="relative h-64 md:h-80">
            <Image
              src={producer.cover_image}
              alt={producer.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-600" />
        )}
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end gap-4">
            {producer.photo && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <Image
                  src={producer.photo}
                  alt={producer.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{producer.name}</h1>
                {producer.verified && (
                  <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                )}
                {producer.featured && (
                  <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-white/90 flex-wrap">
                {producer.region && (
                  <span className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {producer.region}{producer.state ? `, ${producer.state}` : ""}
                  </span>
                )}
                {producer.year_established && (
                  <span className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    Est. {producer.year_established}
                  </span>
                )}
                {producer.farm_size_acres && (
                  <span className="text-sm">
                    {producer.farm_size_acres} acres
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Growing Practices */}
        {producer.practices && producer.practices.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Growing Practices
            </h3>
            <div className="flex flex-wrap gap-2">
              {producer.practices.map((practice) => {
                const info = PRACTICE_INFO[practice] || { label: practice, color: "gray" }
                return (
                  <span
                    key={practice}
                    className="text-xs bg-white text-green-800 px-2 py-1 rounded-full border border-green-200"
                  >
                    {info.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {producer.certifications && producer.certifications.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {producer.certifications.map((cert, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white text-amber-800 px-2 py-1 rounded-full border border-amber-200"
                >
                  {cert.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {producer.website && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Connect
            </h3>
            <a
              href={producer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("story")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "story"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Our Story
          </button>
          {producer.harvests && producer.harvests.length > 0 && (
            <button
              onClick={() => setActiveTab("harvests")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "harvests"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Recent Harvests ({producer.harvests.length})
            </button>
          )}
          {producer.products && producer.products.length > 0 && (
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Products ({producer.products.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "story" && (
        <div className="prose prose-green max-w-none">
          {producer.description && (
            <p className="text-lg text-gray-700 mb-6">{producer.description}</p>
          )}
          {producer.story && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Story</h3>
              <p className="text-gray-700 whitespace-pre-line">{producer.story}</p>
            </div>
          )}
          
          {/* Gallery */}
          {producer.gallery && producer.gallery.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {producer.gallery.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={url}
                      alt={`${producer.name} gallery ${idx + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "harvests" && producer.harvests && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {producer.harvests.map((harvest) => (
            <div
              key={harvest.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {harvest.photo && (
                <div className="relative h-32">
                  <Image
                    src={harvest.photo}
                    alt={harvest.crop_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-medium text-gray-900">{harvest.crop_name}</h4>
                {harvest.variety && (
                  <p className="text-sm text-gray-500">{harvest.variety}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {harvest.season && (
                    <span>{SEASON_LABELS[harvest.season] || harvest.season}</span>
                  )}
                  {harvest.year && <span>{harvest.year}</span>}
                  {harvest.harvest_date && (
                    <span>
                      Harvested {new Date(harvest.harvest_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {harvest.growing_method && (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {harvest.growing_method}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "products" && producer.products && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {producer.products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="relative aspect-square">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm group-hover:text-green-700 transition-colors line-clamp-2">
                  {product.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProducerDetailPage

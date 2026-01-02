"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  LocationIcon, 
  CalendarIcon, 
  LeafIcon,
  BackIcon,
  SunIcon,
  HeartIcon,
  UsersIcon,
} from "@/icons"

interface Garden {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  state: string
  zip: string
  coordinates?: { lat: number; lng: number }
  producer_type: string
  status: string
  total_plots: number
  total_sqft: number
  governance_model: string
  contact_email?: string
  website?: string
  cover_image_url?: string
  gallery_urls?: string[]
  settings?: {
    allow_investments?: boolean
    volunteer_hour_value?: number
    min_plot_fee?: number
  }
  needs?: Array<{ type: string; description: string; priority: string }>
  supporter_benefits?: string[]
}

interface GardenDetailPageProps {
  handle: string
  locale: string
}

const STATUS_INFO: Record<string, { label: string; description: string; color: string }> = {
  active: { 
    label: "Growing Season", 
    description: "Currently growing and accepting support",
    color: "green" 
  },
  planning: { 
    label: "Planning Phase", 
    description: "Preparing for the upcoming season",
    color: "blue" 
  },
  dormant: { 
    label: "Winter Rest", 
    description: "Resting until spring",
    color: "gray" 
  },
  closed: { 
    label: "Closed", 
    description: "No longer active",
    color: "red" 
  },
}

export function GardenDetailPage({ handle, locale }: GardenDetailPageProps) {
  const [garden, setGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"about" | "support" | "volunteer">("about")

  useEffect(() => {
    async function fetchGarden() {
      try {
        const response = await fetch(`/api/gardens/${handle}`)
        if (!response.ok) {
          throw new Error("Garden not found")
        }
        const data = await response.json()
        setGarden(data.garden)
      } catch (err) {
        setError("Could not load garden information")
      } finally {
        setLoading(false)
      }
    }
    fetchGarden()
  }, [handle])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (error || !garden) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <LeafIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Garden Not Found</h2>
        <p className="text-gray-600 mb-4">{error || "This garden doesn't exist."}</p>
        <Link
          href="/gardens"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800"
        >
          <BackIcon className="w-4 h-4" />
          Back to all gardens
        </Link>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[garden.status] || { label: garden.status, color: "gray" }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/gardens"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <BackIcon className="w-4 h-4" />
        All Gardens
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        {garden.cover_image_url ? (
          <div className="relative h-64 md:h-80">
            <Image
              src={garden.cover_image_url}
              alt={garden.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-600" />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              statusInfo.color === "green" ? "bg-green-500" :
              statusInfo.color === "blue" ? "bg-blue-500" :
              statusInfo.color === "red" ? "bg-red-500" :
              "bg-gray-500"
            }`}>
              {statusInfo.label}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{garden.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-white/90 flex-wrap">
            <span className="flex items-center gap-1 text-sm">
              <LocationIcon className="w-4 h-4" />
              {garden.city}, {garden.state}
            </span>
            {garden.total_sqft > 0 && (
              <span className="text-sm">{garden.total_sqft.toLocaleString()} sq ft</span>
            )}
            {garden.total_plots > 0 && (
              <span className="text-sm">{garden.total_plots} plots</span>
            )}
          </div>
        </div>
      </div>

      {/* Three-Tab Layout: About / Support / Volunteer */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "about"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <LeafIcon className="w-4 h-4" />
            About
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "support"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <HeartIcon className="w-4 h-4" />
            Support
          </button>
          <button
            onClick={() => setActiveTab("volunteer")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "volunteer"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Volunteer
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "about" && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {garden.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Garden</h2>
                <p className="text-gray-700 whitespace-pre-line">{garden.description}</p>
              </div>
            )}
            
            {/* Gallery */}
            {garden.gallery_urls && garden.gallery_urls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {garden.gallery_urls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`${garden.name} gallery ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Location Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <LocationIcon className="w-4 h-4" />
                Location
              </h3>
              <p className="text-sm text-gray-700">
                {garden.address}<br />
                {garden.city}, {garden.state} {garden.zip}
              </p>
              {garden.website && (
                <a
                  href={garden.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-800 mt-2 inline-block"
                >
                  Visit Website →
                </a>
              )}
            </div>
            
            {/* Status Card */}
            <div className={`rounded-lg p-4 border ${
              statusInfo.color === "green" ? "bg-green-50 border-green-200" :
              statusInfo.color === "blue" ? "bg-blue-50 border-blue-200" :
              "bg-gray-50 border-gray-200"
            }`}>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <SunIcon className="w-4 h-4" />
                Season Status
              </h3>
              <p className="text-sm font-medium">{statusInfo.label}</p>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "support" && (
        <div className="max-w-2xl">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 mb-8">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Support {garden.name}
            </h2>
            <p className="text-amber-800 mb-4">
              Your contribution helps fund seeds, tools, water systems, and 
              community programs. Every dollar stays local.
            </p>
            
            {/* Support Options */}
            <div className="space-y-3">
              <button className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                Contribute to Seasonal Fund
              </button>
              <button className="w-full bg-white text-amber-800 py-3 px-4 rounded-lg font-medium border border-amber-300 hover:bg-amber-50 transition-colors">
                Sponsor a Garden Plot
              </button>
            </div>
          </div>

          {/* What Support Provides */}
          {garden.supporter_benefits && garden.supporter_benefits.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Supporter Benefits</h3>
              <ul className="space-y-2">
                {garden.supporter_benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Needs */}
          {garden.needs && garden.needs.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">Current Needs</h3>
              <div className="space-y-3">
                {garden.needs.map((need, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border ${
                      need.priority === "high" ? "border-red-200 bg-red-50" :
                      need.priority === "medium" ? "border-amber-200 bg-amber-50" :
                      "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{need.type}</span>
                      {need.priority === "high" && (
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{need.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "volunteer" && (
        <div className="max-w-2xl">
          <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              Volunteer at {garden.name}
            </h2>
            <p className="text-green-800 mb-4">
              Join work parties, help with harvests, or share your expertise. 
              Volunteers earn community credits that can be used at the marketplace.
            </p>
            
            {garden.settings?.volunteer_hour_value && (
              <p className="text-sm text-green-700 mb-4">
                Earn ${garden.settings.volunteer_hour_value.toFixed(2)} in community credits per hour
              </p>
            )}
            
            <button className="w-full bg-green-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-800 transition-colors">
              Sign Up to Volunteer
            </button>
          </div>

          {/* Upcoming Work Parties Placeholder */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Upcoming Work Parties
            </h3>
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No upcoming events scheduled</p>
              <p className="text-sm text-gray-500">Check back soon or contact the garden directly</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GardenDetailPage

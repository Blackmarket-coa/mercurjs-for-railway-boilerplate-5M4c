"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LocationIcon,
  CalendarIcon,
  BackIcon,
  HeartIcon,
} from "@/icons"

interface Kitchen {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  state: string
  zip: string
  coordinates?: { lat: number; lng: number }
  kitchen_type: string
  status: string
  total_stations: number
  total_sqft: number
  max_concurrent_users: number
  hourly_rate?: number
  monthly_membership_fee?: number
  deposit_required?: number
  governance_model?: string
  certifications?: string[]
  amenities?: string[]
  operating_hours?: Record<string, { open: string; close: string }>
  contact_email?: string
  contact_phone?: string
  website?: string
  cover_image_url?: string
  gallery_urls?: string[]
  settings?: {
    min_rental_hours?: number
    advance_booking_days?: number
    cleanup_time_minutes?: number
  }
}

interface KitchenDetailPageProps {
  handle: string
  locale: string
}

const STATUS_INFO: Record<string, { label: string; description: string; color: string }> = {
  active: {
    label: "Open",
    description: "Currently accepting bookings",
    color: "teal"
  },
  planning: {
    label: "Coming Soon",
    description: "Opening soon - join the waitlist",
    color: "blue"
  },
  renovation: {
    label: "Under Renovation",
    description: "Temporarily closed for improvements",
    color: "amber"
  },
  closed: {
    label: "Closed",
    description: "No longer accepting bookings",
    color: "gray"
  },
}

// Kitchen icon component
const KitchenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

// Equipment icon
const EquipmentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// Clock icon
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export function KitchenDetailPage({ handle, locale }: KitchenDetailPageProps) {
  const [kitchen, setKitchen] = useState<Kitchen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"about" | "book" | "support">("about")

  useEffect(() => {
    async function fetchKitchen() {
      try {
        const response = await fetch(`/api/kitchens/${handle}`)
        if (!response.ok) {
          throw new Error("Kitchen not found")
        }
        const data = await response.json()
        setKitchen(data.kitchen)
      } catch (err) {
        setError("Could not load kitchen information")
      } finally {
        setLoading(false)
      }
    }
    fetchKitchen()
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

  if (error || !kitchen) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <KitchenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Kitchen Not Found</h2>
        <p className="text-gray-600 mb-4">{error || "This kitchen doesn't exist."}</p>
        <Link
          href="/kitchens"
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800"
        >
          <BackIcon className="w-4 h-4" />
          Back to all kitchens
        </Link>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[kitchen.status] || { label: kitchen.status, color: "gray" }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/kitchens"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
      >
        <BackIcon className="w-4 h-4" />
        All Kitchens
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        {kitchen.cover_image_url ? (
          <div className="relative h-64 md:h-80">
            <Image
              src={kitchen.cover_image_url}
              alt={kitchen.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-teal-500 to-cyan-600" />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              statusInfo.color === "teal" ? "bg-teal-500" :
              statusInfo.color === "blue" ? "bg-blue-500" :
              statusInfo.color === "amber" ? "bg-amber-500" :
              "bg-gray-500"
            }`}>
              {statusInfo.label}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{kitchen.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-white/90 flex-wrap">
            <span className="flex items-center gap-1 text-sm">
              <LocationIcon className="w-4 h-4" />
              {kitchen.city}, {kitchen.state}
            </span>
            {kitchen.total_sqft > 0 && (
              <span className="text-sm">{kitchen.total_sqft.toLocaleString()} sq ft</span>
            )}
            {kitchen.total_stations > 0 && (
              <span className="text-sm">{kitchen.total_stations} stations</span>
            )}
            {kitchen.hourly_rate && (
              <span className="text-sm font-medium">${kitchen.hourly_rate}/hr</span>
            )}
          </div>
        </div>
      </div>

      {/* Three-Tab Layout: About / Book / Support */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "about"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <KitchenIcon className="w-4 h-4" />
            About
          </button>
          <button
            onClick={() => setActiveTab("book")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "book"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Book Time
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "support"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <HeartIcon className="w-4 h-4" />
            Support
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "about" && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {kitchen.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Kitchen</h2>
                <p className="text-gray-700 whitespace-pre-line">{kitchen.description}</p>
              </div>
            )}

            {/* Amenities */}
            {kitchen.amenities && kitchen.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <EquipmentIcon className="w-5 h-5" />
                  Amenities & Equipment
                </h3>
                <div className="flex flex-wrap gap-2">
                  {kitchen.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {kitchen.certifications && kitchen.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {kitchen.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm border border-teal-200"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {kitchen.gallery_urls && kitchen.gallery_urls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {kitchen.gallery_urls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`${kitchen.name} gallery ${idx + 1}`}
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
                {kitchen.address}<br />
                {kitchen.city}, {kitchen.state} {kitchen.zip}
              </p>
              {kitchen.website && (
                <a
                  href={kitchen.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-700 hover:text-teal-800 mt-2 inline-block"
                >
                  Visit Website →
                </a>
              )}
            </div>

            {/* Operating Hours */}
            {kitchen.operating_hours && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Operating Hours
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  {Object.entries(kitchen.operating_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize">{day}</span>
                      <span>{hours.open} - {hours.close}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Card */}
            <div className={`rounded-lg p-4 border ${
              statusInfo.color === "teal" ? "bg-teal-50 border-teal-200" :
              statusInfo.color === "blue" ? "bg-blue-50 border-blue-200" :
              statusInfo.color === "amber" ? "bg-amber-50 border-amber-200" :
              "bg-gray-50 border-gray-200"
            }`}>
              <h3 className="font-medium text-gray-900 mb-2">Status</h3>
              <p className="text-sm font-medium">{statusInfo.label}</p>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>

            {/* Contact */}
            {(kitchen.contact_email || kitchen.contact_phone) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Contact</h3>
                {kitchen.contact_email && (
                  <p className="text-sm text-gray-700">
                    <a href={`mailto:${kitchen.contact_email}`} className="text-teal-700 hover:text-teal-800">
                      {kitchen.contact_email}
                    </a>
                  </p>
                )}
                {kitchen.contact_phone && (
                  <p className="text-sm text-gray-700 mt-1">
                    <a href={`tel:${kitchen.contact_phone}`} className="text-teal-700 hover:text-teal-800">
                      {kitchen.contact_phone}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "book" && (
        <div className="max-w-2xl">
          <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 mb-8">
            <h2 className="text-lg font-semibold text-teal-900 mb-2">
              Book Kitchen Time at {kitchen.name}
            </h2>
            <p className="text-teal-800 mb-4">
              Reserve a station or the full kitchen for your food production needs.
              Hourly, daily, and monthly options available.
            </p>

            {/* Pricing Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {kitchen.hourly_rate && (
                <div className="bg-white rounded-lg p-3 border border-teal-200">
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="text-lg font-semibold text-teal-700">${kitchen.hourly_rate}/hr</p>
                </div>
              )}
              {kitchen.monthly_membership_fee && (
                <div className="bg-white rounded-lg p-3 border border-teal-200">
                  <p className="text-sm text-gray-600">Monthly Membership</p>
                  <p className="text-lg font-semibold text-teal-700">${kitchen.monthly_membership_fee}/mo</p>
                </div>
              )}
            </div>

            {kitchen.deposit_required && (
              <p className="text-sm text-teal-700 mb-4">
                Security deposit required: ${kitchen.deposit_required}
              </p>
            )}

            {/* Booking Options */}
            <div className="space-y-3">
              <button className="w-full bg-teal-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-800 transition-colors">
                Book Kitchen Time
              </button>
              <button className="w-full bg-white text-teal-800 py-3 px-4 rounded-lg font-medium border border-teal-300 hover:bg-teal-50 transition-colors">
                Request a Tour
              </button>
            </div>
          </div>

          {/* Booking Requirements */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-1">✓</span>
                Valid food handler&apos;s certification
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-1">✓</span>
                Liability insurance (or purchase through kitchen)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-1">✓</span>
                Completed orientation session
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 mt-1">✓</span>
                Signed facility usage agreement
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "support" && (
        <div className="max-w-2xl">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 mb-8">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Support {kitchen.name}
            </h2>
            <p className="text-amber-800 mb-4">
              Your contribution helps maintain equipment, expand capacity, and
              provide subsidized access for community members starting food businesses.
            </p>

            {/* Support Options */}
            <div className="space-y-3">
              <button className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                Make a Contribution
              </button>
              <button className="w-full bg-white text-amber-800 py-3 px-4 rounded-lg font-medium border border-amber-300 hover:bg-amber-50 transition-colors">
                Sponsor a Food Entrepreneur
              </button>
            </div>
          </div>

          {/* Impact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Your Support Provides</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-teal-600 mt-1">✓</span>
                Equipment maintenance and upgrades
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-teal-600 mt-1">✓</span>
                Subsidized rates for new food entrepreneurs
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-teal-600 mt-1">✓</span>
                Training programs and mentorship
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="text-teal-600 mt-1">✓</span>
                Community food access programs
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default KitchenDetailPage

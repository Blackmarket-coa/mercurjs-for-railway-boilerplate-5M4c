"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { LocationIcon, CalendarIcon, AwardIcon, CollapseIcon, OpenIcon, LeafIcon } from "@/icons"

// Growing practice labels
const PRACTICE_LABELS: Record<string, string> = {
  ORGANIC: "Organic",
  CERTIFIED_ORGANIC: "Certified Organic",
  REGENERATIVE: "Regenerative",
  CONVENTIONAL: "Conventional",
  BIODYNAMIC: "Biodynamic",
  PERMACULTURE: "Permaculture",
  HYDROPONIC: "Hydroponic",
  AQUAPONIC: "Aquaponic",
  NO_SPRAY: "No Spray",
  IPM: "Integrated Pest Management",
}

// Lot grade labels
const GRADE_LABELS: Record<string, string> = {
  PREMIUM: "Premium",
  GRADE_A: "Grade A",
  GRADE_B: "Grade B",
  PROCESSING: "Processing",
  IMPERFECT: "Imperfect",
  SECONDS: "Seconds",
}

interface ProducerData {
  id: string
  name: string
  handle: string
  region?: string
  state?: string
  practices?: string[]
  certifications?: Array<{ name: string; issuer?: string }>
  story?: string
  photo?: string
  year_established?: number
  verified?: boolean
}

interface HarvestData {
  id: string
  crop_name: string
  variety?: string
  harvest_date?: string
  growing_method?: string
  farmer_notes?: string
  taste_notes?: string
  season?: string
  year?: number
  photo?: string
}

interface LotData {
  id: string
  lot_number?: string
  grade?: string
  batch_date?: string
  best_by_date?: string
}

interface ProvenanceData {
  producer: ProducerData
  harvest?: HarvestData | null
  lot?: LotData | null
}

interface FarmStoryProps {
  productId: string
}

export function FarmStory({ productId }: FarmStoryProps) {
  const [provenance, setProvenance] = useState<ProvenanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProvenance() {
      try {
        const response = await fetch(`/api/products/${productId}/provenance`)
        const data = await response.json()
        
        if (data.provenance) {
          setProvenance(data.provenance)
        }
      } catch (err) {
        setError("Could not load farm information")
      } finally {
        setLoading(false)
      }
    }

    fetchProvenance()
  }, [productId])

  if (loading) {
    return (
      <div className="border border-ui-border-base rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )
  }

  if (error || !provenance) {
    return null
  }

  const { producer, harvest, lot } = provenance

  return (
    <div className="border border-green-200 bg-green-50/50 rounded-lg overflow-hidden mt-4">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-green-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {producer.photo ? (
            <Image
              src={producer.photo}
              alt={producer.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <LeafIcon className="w-5 h-5 text-green-700" />
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-800">From {producer.name}</span>
              {producer.verified && (
                <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
                  ✓ Verified
                </span>
              )}
            </div>
            {producer.region && (
              <span className="text-sm text-green-700 flex items-center gap-1">
                <LocationIcon className="w-3 h-3" />
                {producer.region}{producer.state ? `, ${producer.state}` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-sm">Farm Story</span>
          <CollapseIcon className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-green-200 pt-3 space-y-4">
          {/* Harvest Info */}
          {harvest && (
            <div className="bg-white rounded-lg p-3 border border-green-100">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Harvest Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {harvest.harvest_date && (
                  <div>
                    <span className="text-gray-500">Harvested:</span>{" "}
                    <span className="text-gray-700">
                      {new Date(harvest.harvest_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {harvest.growing_method && (
                  <div>
                    <span className="text-gray-500">Growing Method:</span>{" "}
                    <span className="text-gray-700">{harvest.growing_method}</span>
                  </div>
                )}
                {harvest.variety && (
                  <div>
                    <span className="text-gray-500">Variety:</span>{" "}
                    <span className="text-gray-700">{harvest.variety}</span>
                  </div>
                )}
                {harvest.season && (
                  <div>
                    <span className="text-gray-500">Season:</span>{" "}
                    <span className="text-gray-700">{harvest.season} {harvest.year}</span>
                  </div>
                )}
              </div>
              {harvest.taste_notes && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  &ldquo;{harvest.taste_notes}&rdquo;
                </p>
              )}
              {harvest.farmer_notes && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">From the farmer:</span> {harvest.farmer_notes}
                </p>
              )}
            </div>
          )}

          {/* Lot Info */}
          {lot && (
            <div className="bg-white rounded-lg p-3 border border-green-100">
              <h4 className="font-medium text-green-800 mb-2">Batch Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {lot.lot_number && (
                  <div>
                    <span className="text-gray-500">Lot:</span>{" "}
                    <span className="text-gray-700 font-mono">{lot.lot_number}</span>
                  </div>
                )}
                {lot.grade && (
                  <div>
                    <span className="text-gray-500">Grade:</span>{" "}
                    <span className="text-gray-700">{GRADE_LABELS[lot.grade] || lot.grade}</span>
                  </div>
                )}
                {lot.best_by_date && (
                  <div>
                    <span className="text-gray-500">Best By:</span>{" "}
                    <span className="text-gray-700">
                      {new Date(lot.best_by_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Growing Practices */}
          {producer.practices && producer.practices.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {producer.practices.map((practice: string) => (
                <span
                  key={practice}
                  className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                >
                  <LeafIcon className="w-3 h-3" />
                  {PRACTICE_LABELS[practice] || practice}
                </span>
              ))}
            </div>
          )}

          {/* Certifications */}
          {producer.certifications && producer.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {producer.certifications.map((cert: { name: string; issuer?: string }, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full"
                >
                  <AwardIcon className="w-3 h-3" />
                  {cert.name}
                </span>
              ))}
            </div>
          )}

          {/* Farm Story excerpt */}
          {producer.story && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {producer.story}
            </p>
          )}

          {/* Link to farm profile */}
          <Link
            href={`/producers/${producer.handle}`}
            className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium"
          >
            Visit {producer.name}&apos;s farm page
            <OpenIcon className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default FarmStory

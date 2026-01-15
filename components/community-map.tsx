"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

export interface MapMarker {
  id: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  timestamp: Date
  confidence: number
  label: string
}

interface CommunityMapProps {
  markers: MapMarker[]
  title?: string
}

const IBADAN_LOCATIONS = [
  { name: "Dugbe Market", x: 35, y: 45 },
  { name: "Mokola Hill", x: 55, y: 30 },
  { name: "Mapo Hall", x: 25, y: 60 },
  { name: "University of Ibadan", x: 70, y: 55 },
  { name: "Ibadan Central", x: 40, y: 50 },
  { name: "Eleyele Park", x: 60, y: 25 },
  { name: "Ojoo Junction", x: 15, y: 35 },
  { name: "Samonda Area", x: 80, y: 70 },
]

export function CommunityMap({ markers, title = "Detection Heatmap - Ibadan" }: CommunityMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with grid background
    ctx.fillStyle = "#111827"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#1f2937"
    ctx.lineWidth = 1
    const gridSize = 40
    for (let i = 0; i <= canvas.width; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i <= canvas.height; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw Ibadan location markers
    for (const location of IBADAN_LOCATIONS) {
      const x = (location.x / 100) * canvas.width
      const y = (location.y / 100) * canvas.height

      const isHoveredLoc = hoveredLocation === location.name

      // Draw location circle
      ctx.fillStyle = isHoveredLoc ? "#6366f1" : "#4f46e5"
      ctx.beginPath()
      ctx.arc(x, y, isHoveredLoc ? 6 : 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw location label
      ctx.fillStyle = "#d1d5db"
      ctx.font = "10px monospace"
      ctx.textAlign = "left"
      ctx.fillText(location.name, x + 10, y - 5)
    }

    // Draw heatmap from detection markers
    if (markers.length > 0) {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (const marker of markers) {
        const pixelX = Math.round((marker.x / 100) * canvas.width)
        const pixelY = Math.round((marker.y / 100) * canvas.height)
        const radius = 30 * (marker.confidence / 100)

        // Draw Gaussian blur around marker
        for (let dx = -radius * 2; dx < radius * 2; dx++) {
          for (let dy = -radius * 2; dy < radius * 2; dy++) {
            const x = pixelX + dx
            const y = pixelY + dy
            if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
              const dist = Math.sqrt(dx * dx + dy * dy)
              const intensity = Math.exp(-(dist * dist) / (radius * radius)) * (marker.confidence / 100)
              const pixelIndex = (y * canvas.width + x) * 4

              data[pixelIndex] = Math.max(data[pixelIndex], Math.round(intensity * 255)) // R
              data[pixelIndex + 1] = Math.round(intensity * 100) // G
              data[pixelIndex + 2] = Math.round(intensity * 50) // B
              data[pixelIndex + 3] = Math.max(data[pixelIndex + 3], Math.round(intensity * 200)) // A
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    // Draw detection markers as points
    for (const marker of markers) {
      const x = (marker.x / 100) * canvas.width
      const y = (marker.y / 100) * canvas.height

      const isHovered = hoveredMarker === marker.id

      // Draw marker circle
      ctx.fillStyle = isHovered ? "#fbbf24" : "#f59e0b"
      ctx.beginPath()
      ctx.arc(x, y, isHovered ? 10 : 8, 0, Math.PI * 2)
      ctx.fill()

      // Draw marker outline
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, isHovered ? 10 : 8, 0, Math.PI * 2)
      ctx.stroke()

      // Draw confidence ring
      ctx.strokeStyle = `rgba(245, 158, 11, ${marker.confidence / 100})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw border
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }, [markers, hoveredMarker, hoveredLocation])

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Find nearest detection marker within 10% distance
    let nearest: string | null = null
    let minDist = 10

    for (const marker of markers) {
      const dx = marker.x - x
      const dy = marker.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < minDist) {
        minDist = dist
        nearest = marker.id
      }
    }

    setHoveredMarker(nearest)

    // Find nearest location within 8% distance
    let nearestLoc: string | null = null
    let minLocDist = 8

    for (const location of IBADAN_LOCATIONS) {
      const dx = location.x - x
      const dy = location.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < minLocDist) {
        minLocDist = dist
        nearestLoc = location.name
      }
    }

    setHoveredLocation(nearestLoc)
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
      <h3 className="text-sm font-medium text-gray-200 mb-4">{title}</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseMove={handleCanvasHover}
        onMouseLeave={() => {
          setHoveredMarker(null)
          setHoveredLocation(null)
        }}
        className="w-full border border-gray-700 rounded bg-gray-900 cursor-crosshair"
      />

      {/* Legend */}
      <div className="mt-4 space-y-3">
        <div className="text-xs text-gray-500 font-medium">Location References:</div>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {IBADAN_LOCATIONS.map((location) => (
            <div
              key={location.name}
              onMouseEnter={() => setHoveredLocation(location.name)}
              onMouseLeave={() => setHoveredLocation(null)}
              className="flex items-center gap-2 px-2 py-1 bg-gray-900 rounded text-xs hover:bg-gray-800 cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-gray-300 truncate">{location.name}</span>
            </div>
          ))}
        </div>

        {/* Detection Markers */}
        {markers.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium mt-3 mb-2">Recent Detections:</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {markers.slice(0, 5).map((marker) => (
                <div
                  key={marker.id}
                  onMouseEnter={() => setHoveredMarker(marker.id)}
                  onMouseLeave={() => setHoveredMarker(null)}
                  className="flex items-center justify-between px-2 py-1 bg-gray-900 rounded text-xs hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-gray-300 truncate">{marker.label}</span>
                  </div>
                  <span className="text-gray-500">{Math.round(marker.confidence)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {markers.length === 0 && <p className="text-xs text-gray-500 mt-2">No detections yet. Monitoring active.</p>}
      </div>
    </div>
  )
}

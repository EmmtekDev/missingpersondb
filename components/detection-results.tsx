"use client"

import { useEffect, useState } from "react"
import type { Region } from "@/utils/face-detection"
import type { MissingPerson } from "./missing-person-profile"

export type DetectionResult = {
  id: string
  timestamp: Date
  targetPerson: MissingPerson
  detectedRegions: Region[]
  matchConfidence: number
  location: { x: number; y: number }
}

interface DetectionResultsProps {
  results: DetectionResult[]
  onResultSelected?: (result: DetectionResult) => void
}

export function DetectionResults({ results, onResultSelected }: DetectionResultsProps) {
  const [sortedResults, setSortedResults] = useState<DetectionResult[]>([])

  useEffect(() => {
    const sorted = [...results].sort((a, b) => b.matchConfidence - a.matchConfidence)
    setSortedResults(sorted)
  }, [results])

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 75) return "text-green-400 bg-green-950"
    if (confidence > 50) return "text-yellow-400 bg-yellow-950"
    return "text-orange-400 bg-orange-950"
  }

  const getConfidenceStatus = (confidence: number) => {
    if (confidence > 75) return "Strong Match"
    if (confidence > 50) return "Potential Match"
    return "Weak Match"
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
      <h3 className="text-sm font-medium text-gray-200 mb-4">Detection Results</h3>

      {sortedResults.length === 0 ? (
        <p className="text-xs text-gray-500 py-8">No matches detected yet. System monitoring...</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedResults.map((result) => (
            <button
              key={result.id}
              onClick={() => onResultSelected?.(result)}
              className="w-full text-left border border-gray-700 rounded-lg p-3 bg-gray-900 hover:bg-gray-800 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100">{result.targetPerson.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.detectedRegions.length} face region{result.detectedRegions.length !== 1 ? "s" : ""} detected
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.timestamp.toLocaleTimeString()} at ({Math.round(result.location.x)}%,{" "}
                    {Math.round(result.location.y)}%)
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap ${getConfidenceColor(result.matchConfidence)}`}
                >
                  {Math.round(result.matchConfidence)}%
                </div>
              </div>

              <div className="mt-2 w-full bg-gray-800 rounded h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all ${result.matchConfidence > 75 ? "bg-green-600" : result.matchConfidence > 50 ? "bg-yellow-600" : "bg-orange-600"}`}
                  style={{ width: `${result.matchConfidence}%` }}
                />
              </div>

              <p className={`text-xs mt-2 font-medium ${getConfidenceColor(result.matchConfidence).split(" ")[0]}`}>
                {getConfidenceStatus(result.matchConfidence)}
              </p>
            </button>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="border-t border-gray-700 mt-4 pt-4">
          <p className="text-xs text-gray-500">Total detections: {results.length}</p>
          <p className="text-xs text-gray-600 mt-1">
            Strong matches: {results.filter((r) => r.matchConfidence > 75).length}
          </p>
        </div>
      )}
    </div>
  )
}

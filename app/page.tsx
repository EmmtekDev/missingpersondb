"use client"

import { useState, useRef, useEffect } from "react"
import { CameraFeed } from "@/components/camera-feed"
import { ActivityLog } from "@/components/activity-log"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { AlertSystem } from "@/components/alert-system"
import { MissingPersonProfile, type MissingPerson } from "@/components/missing-person-profile"
import { CommunityMap, type MapMarker } from "@/components/community-map"
import { DetectionResults, type DetectionResult } from "@/components/detection-results"
import { FaceMatcherDemo, type Region } from "@/utils/face-detection"
import { activityStore } from "@/utils/activity-store"

const DEMO_MISSING_PERSONS: MissingPerson[] = [
  {
    id: "MP001",
    name: "Sarah Mitchell",
    age: 34,
    description: "Brown hair, average build, last seen wearing a blue jacket and jeans",
    lastSeen: "Today, 10:30 AM",
    contactInfo: "911 / Local Police: (555) 123-4567",
    photoUrl: "/missing-person-1.jpg",
  },
]

const DEMO_PERSON = DEMO_MISSING_PERSONS[0]

export default function Home() {
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([])
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([])
  const [detectionStatus, setDetectionStatus] = useState<"not-detected" | "detected" | "confirmed">("not-detected")
  const [matchConfidence, setMatchConfidence] = useState(0)
  const faceMatcherRef = useRef<FaceMatcherDemo | null>(null)

  useEffect(() => {
    faceMatcherRef.current = new FaceMatcherDemo()
  }, [])

  const handleFaceDetected = (regions: Region[], confidence: number) => {
    if (!faceMatcherRef.current) return

    if (regions.length > 0 && confidence > 30) {
      const matchConfidence = faceMatcherRef.current.matchFaceToTarget(regions[0], {
        x: 0,
        y: 0,
        w: 100,
        h: 150,
        pixelCount: 15000,
      })

      setMatchConfidence(matchConfidence)

      if (matchConfidence > 75) {
        setDetectionStatus("confirmed")
        activityStore.addActivity("person", `Strong match found: ${DEMO_PERSON.name}`, "high")
      } else if (matchConfidence > 50) {
        setDetectionStatus("detected")
        activityStore.addActivity("person", `Potential match: ${DEMO_PERSON.name} (${matchConfidence}%)`, "medium")
      }

      const newResult: DetectionResult = {
        id: `result-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        targetPerson: DEMO_PERSON,
        detectedRegions: regions,
        matchConfidence,
        location: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      }

      setDetectionResults((prev) => [newResult, ...prev].slice(0, 50))

      const newMarker: MapMarker = {
        id: newResult.id,
        x: newResult.location.x,
        y: newResult.location.y,
        timestamp: new Date(),
        confidence: matchConfidence,
        label: `${DEMO_PERSON.name} (${Math.round(matchConfidence)}%)`,
      }

      setMapMarkers((prev) => [newMarker, ...prev].slice(0, 20))
    }
  }

  const handleMotionDetected = (level: number) => {
    if (level > 20) {
      activityStore.addActivity("motion", `Motion detected at ${level}% level`, level > 50 ? "high" : "medium")
    }
  }

  const handleObjectDetected = (confidence: number) => {
    if (confidence > 40) {
      activityStore.addActivity("object", `Object detected with ${Math.round(confidence)}% confidence`, "low")
    }
  }

  const handleActivityDetected = (type: string, time: Date) => {
    // Activity logging is handled by callbacks above
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-950 px-4 py-6 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-mono font-semibold">Missing Persons Detection System</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time monitoring with infrared imaging and face recognition</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 space-y-8">
        {/* Live Camera Feed */}
        <section>
          <h2 className="text-sm font-medium text-gray-300 mb-4">Live Camera Feed</h2>
          <CameraFeed
            onMotionDetected={handleMotionDetected}
            onObjectDetected={handleObjectDetected}
            onActivityDetected={handleActivityDetected}
            onFaceDetected={handleFaceDetected}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Missing Person Profile */}
          <div>
            <h2 className="text-sm font-medium text-gray-300 mb-4">Target Person</h2>
            <MissingPersonProfile
              person={DEMO_PERSON}
              detectionStatus={detectionStatus}
              matchConfidence={matchConfidence}
            />
          </div>

          {/* Center Column - Community Map */}
          <div>
            <h2 className="text-sm font-medium text-gray-300 mb-4">Detection Locations</h2>
            <CommunityMap markers={mapMarkers} title="Location Heatmap" />
          </div>

          {/* Right Column - Detection Results */}
          <div>
            <h2 className="text-sm font-medium text-gray-300 mb-4">Match Results</h2>
            <DetectionResults results={detectionResults} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Statistics */}
          <div>
            <h2 className="text-sm font-medium text-gray-300 mb-4">Monitoring Stats</h2>
            <StatisticsDashboard />
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-300 mb-4">System Activity</h2>
            <ActivityLog />
          </div>
        </div>

        {/* System Info */}
        <section className="border border-gray-700 rounded-lg p-4 bg-gray-950">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-500">System</p>
              <p className="text-gray-200 font-mono">Operational</p>
            </div>
            <div>
              <p className="text-gray-500">Camera</p>
              <p className="text-green-500 font-mono">Active</p>
            </div>
            <div>
              <p className="text-gray-500">Detection</p>
              <p className="text-gray-200 font-mono">Enabled</p>
            </div>
            <div>
              <p className="text-gray-500">Targets</p>
              <p className="text-gray-200 font-mono">{DEMO_MISSING_PERSONS.length}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Alert System */}
      <AlertSystem />
    </main>
  )
}

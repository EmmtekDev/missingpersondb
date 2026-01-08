"use client"

import { useState } from "react"
import { CameraFeed } from "@/components/camera-feed"
import { ActivityLog } from "@/components/activity-log"
import { StatisticsDashboard } from "@/components/statistics-dashboard"
import { AlertSystem } from "@/components/alert-system"
import { activityStore } from "@/utils/activity-store"

export default function Home() {
  const [systemStatus, setSystemStatus] = useState("active")

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
          <h1 className="text-2xl font-mono font-semibold">Community Watch System</h1>
          <p className="text-xs text-gray-500 mt-1">Low-cost monitoring with motion and object detection</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 space-y-8">
        {/* Camera Section */}
        <section>
          <h2 className="text-sm font-medium text-gray-300 mb-4">Live Feed</h2>
          <CameraFeed
            onMotionDetected={handleMotionDetected}
            onObjectDetected={handleObjectDetected}
            onActivityDetected={handleActivityDetected}
          />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Statistics */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-medium text-gray-300 mb-4">Monitoring</h2>
            <StatisticsDashboard />
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-gray-300 mb-4">Recent Activity</h2>
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
              <p className="text-gray-500">Uptime</p>
              <p className="text-gray-200 font-mono">Live</p>
            </div>
          </div>
        </section>
      </div>

      {/* Alert System */}
      <AlertSystem />
    </main>
  )
}

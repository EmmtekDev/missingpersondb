"use client"

import { useEffect, useState } from "react"
import { activityStore } from "@/utils/activity-store"

interface Stats {
  total: number
  motion: number
  object: number
  alert: number
}

export function StatisticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    motion: 0,
    object: 0,
    alert: 0,
  })
  const [motionLevel, setMotionLevel] = useState(0)
  const [objectConfidence, setObjectConfidence] = useState(0)

  useEffect(() => {
    const updateStats = () => {
      setStats(activityStore.getActivityStats())
    }

    updateStats()
    const unsubscribe = activityStore.subscribe(updateStats)
    return unsubscribe
  }, [])

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMotionLevel(Math.max(0, motionLevel - 2 + Math.random() * 4))
      setObjectConfidence(Math.max(0, objectConfidence - 1 + Math.random() * 2))
    }, 500)

    return () => clearInterval(interval)
  }, [motionLevel, objectConfidence])

  const StatCard = ({ label, value, unit }: { label: string; value: number; unit?: string }) => (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className="text-2xl font-mono font-semibold text-white">
        {value}
        <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Events" value={stats.total} />
        <StatCard label="Motion Events" value={stats.motion} />
        <StatCard label="Object Events" value={stats.object} />
        <StatCard label="Alerts" value={stats.alert} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
          <p className="text-xs text-gray-400 mb-3">Motion Level</p>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="bg-red-500 h-full transition-all duration-100" style={{ width: `${motionLevel}%` }} />
          </div>
          <p className="text-sm font-mono mt-2 text-red-500">{Math.round(motionLevel)}%</p>
        </div>

        <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
          <p className="text-xs text-gray-400 mb-3">Object Detection</p>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-100"
              style={{ width: `${objectConfidence}%` }}
            />
          </div>
          <p className="text-sm font-mono mt-2 text-green-500">{Math.round(objectConfidence)}%</p>
        </div>
      </div>

      <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
        <p className="text-xs text-gray-400 mb-3">System Status</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm text-gray-300">Camera Active</p>
        </div>
      </div>
    </div>
  )
}

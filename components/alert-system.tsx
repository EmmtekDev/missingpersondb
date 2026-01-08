"use client"

import { useEffect, useState } from "react"
import { activityStore } from "@/utils/activity-store"
import { AlertCircle, X } from "lucide-react"

interface Alert {
  id: string
  type: "motion" | "object"
  timestamp: Date
  severity: "low" | "medium" | "high"
}

export function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkForAlerts = () => {
      const activities = activityStore.getActivities(50)

      // Create alerts from recent high-activity events
      const newAlerts: Alert[] = []

      const recentMotion = activities.filter((a) => a.type === "motion").slice(0, 5)
      const recentObjects = activities.filter((a) => a.type === "object").slice(0, 5)

      if (recentMotion.length > 3) {
        newAlerts.push({
          id: "motion-alert",
          type: "motion",
          timestamp: new Date(),
          severity: "high",
        })
      }

      if (recentObjects.length > 2) {
        newAlerts.push({
          id: "object-alert",
          type: "object",
          timestamp: new Date(),
          severity: "medium",
        })
      }

      if (newAlerts.length > 0) {
        setAlerts(newAlerts)
        setIsOpen(true)
      }
    }

    const interval = setInterval(checkForAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const closeAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "border-red-600 bg-red-950"
      case "medium":
        return "border-yellow-600 bg-yellow-950"
      case "low":
        return "border-blue-600 bg-blue-950"
    }
  }

  const getAlertMessage = (type: Alert["type"]) => {
    switch (type) {
      case "motion":
        return "High motion activity detected"
      case "object":
        return "Multiple objects detected in frame"
    }
  }

  if (!isOpen || alerts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-xs">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 rounded-lg p-3 text-sm ${getSeverityColor(alert.severity)} flex items-start justify-between gap-2`}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-inherit" />
            <div>
              <p className="font-medium text-white">{getAlertMessage(alert.type)}</p>
              <p className="text-xs text-gray-400">{alert.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
          <button onClick={() => closeAlert(alert.id)} className="flex-shrink-0 hover:opacity-75 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

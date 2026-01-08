"use client"

import { useEffect, useState } from "react"
import { type Activity, activityStore } from "@/utils/activity-store"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    setActivities(activityStore.getActivities())

    const unsubscribe = activityStore.subscribe(() => {
      setActivities(activityStore.getActivities())
    })

    return unsubscribe
  }, [])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "motion":
        return "●"
      case "object":
        return "◆"
      case "alert":
        return "!"
      default:
        return "•"
    }
  }

  const getSeverityColor = (severity: Activity["severity"]) => {
    switch (severity) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-950">
      <h3 className="text-sm font-medium text-gray-200 mb-4">Activity Log</h3>
      <ScrollArea className="h-96">
        <div className="space-y-2 pr-4">
          {activities.length === 0 ? (
            <p className="text-xs text-gray-500 py-8">No activity detected</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-2 text-xs text-gray-300 border-b border-gray-800 pb-2"
              >
                <span className={`${getSeverityColor(activity.severity)} min-w-fit`}>
                  {getActivityIcon(activity.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium capitalize">{activity.type}</span>
                    <span className="text-gray-500 text-right">{activity.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-500 truncate">{activity.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

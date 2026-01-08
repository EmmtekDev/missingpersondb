// Simple in-memory activity store
export interface Activity {
  id: string
  type: "motion" | "object" | "alert"
  timestamp: Date
  details: string
  severity: "low" | "medium" | "high"
}

export class ActivityStore {
  private activities: Activity[] = []
  private maxActivities = 500
  private listeners: Set<() => void> = new Set()

  addActivity(type: Activity["type"], details: string, severity: Activity["severity"] = "low") {
    const activity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      timestamp: new Date(),
      details,
      severity,
    }

    this.activities.unshift(activity)
    if (this.activities.length > this.maxActivities) {
      this.activities.pop()
    }

    this.notifyListeners()
    return activity
  }

  getActivities(limit = 100) {
    return this.activities.slice(0, limit)
  }

  getActivityStats() {
    const stats = {
      total: this.activities.length,
      motion: this.activities.filter((a) => a.type === "motion").length,
      object: this.activities.filter((a) => a.type === "object").length,
      alert: this.activities.filter((a) => a.type === "alert").length,
    }
    return stats
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb())
  }

  clear() {
    this.activities = []
    this.notifyListeners()
  }
}

// Singleton instance
export const activityStore = new ActivityStore()

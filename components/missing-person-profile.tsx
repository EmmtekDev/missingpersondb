"use client"

import { useState } from "react"
import { ImageUpload } from "./image-upload"

export interface MissingPerson {
  id: string
  name: string
  age: number
  description: string
  lastSeen: string
  contactInfo: string
  photoUrl: string
}

interface MissingPersonProfileProps {
  person: MissingPerson
  detectionStatus: "not-detected" | "detected" | "confirmed"
  matchConfidence?: number
}

export function MissingPersonProfile({ person, detectionStatus, matchConfidence = 0 }: MissingPersonProfileProps) {
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [personName, setPersonName] = useState<string>(person.name)

  const getStatusColor = () => {
    switch (detectionStatus) {
      case "detected":
        return "border-yellow-600 bg-yellow-950"
      case "confirmed":
        return "border-green-600 bg-green-950"
      default:
        return "border-gray-600 bg-gray-950"
    }
  }

  const getStatusText = () => {
    switch (detectionStatus) {
      case "detected":
        return "Potential Match"
      case "confirmed":
        return "Confirmed Detection"
      default:
        return "Monitoring"
    }
  }

  return (
    <div className={`border-l-4 rounded-lg p-6 ${getStatusColor()}`}>
      <div className="space-y-4">
        {/* Name Input Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Missing Person Name</label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Enter person's name"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-mono font-semibold text-gray-100">{personName || person.name}</h3>
            <p className="text-xs text-gray-400 mt-1">ID: {person.id}</p>
          </div>
          <div className="px-3 py-1 rounded bg-gray-700 border border-gray-600">
            <p className="text-xs font-medium text-gray-200">{getStatusText()}</p>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400">Reference Photo</p>
          <ImageUpload onImageUpload={setUploadedImage} currentImage={uploadedImage} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-500 font-medium">Age</p>
            <p className="text-gray-200 font-mono mt-1">{person.age} years</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Last Seen</p>
            <p className="text-gray-200 font-mono mt-1">{person.lastSeen}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-gray-500 font-medium text-xs mb-2">Description</p>
          <p className="text-gray-300 text-xs leading-relaxed">{person.description}</p>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-500 font-medium text-xs mb-2">Report Contact</p>
          <p className="text-gray-200 font-mono text-xs">{person.contactInfo}</p>
        </div>

        {/* Match Confidence */}
        {(detectionStatus === "detected" || detectionStatus === "confirmed") && (
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 font-medium text-xs">Match Confidence</p>
              <p className="text-yellow-400 font-mono text-xs">{Math.round(matchConfidence)}%</p>
            </div>
            <div className="w-full bg-gray-800 rounded h-2 overflow-hidden">
              <div className="bg-yellow-600 h-full transition-all" style={{ width: `${matchConfidence}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void
  currentImage?: string
}

export function ImageUpload({ onImageUpload, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentImage)
  const [isDragging, setIsDragging] = useState(false)

  const handleImageChange = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onImageUpload(result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleImageChange(file)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
        isDragging ? "border-blue-500 bg-blue-950" : "border-gray-600 bg-gray-900"
      }`}
    >
      {preview ? (
        <div className="space-y-3">
          <img src={preview || "/placeholder.svg"} alt="Uploaded" className="w-full h-48 object-cover rounded" />
          <button
            onClick={() => document.getElementById("file-input")?.click()}
            className="w-full px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition"
          >
            Change Image
          </button>
        </div>
      ) : (
        <div className="space-y-3 py-6">
          <p className="text-sm text-gray-300">Drag image here or click to upload</p>
          <p className="text-xs text-gray-500">PNG, JPG, or GIF (max 5MB)</p>
          <button
            onClick={() => document.getElementById("file-input")?.click()}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition"
          >
            Select Image
          </button>
        </div>
      )}
      <input id="file-input" type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
    </div>
  )
}

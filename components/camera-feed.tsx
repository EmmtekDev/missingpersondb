"use client"

import { useEffect, useRef, useState } from "react"
import { MotionDetector, SimpleObjectDetector } from "@/utils/motion-detection"

interface CameraFeedProps {
  onMotionDetected?: (level: number) => void
  onObjectDetected?: (confidence: number) => void
  onActivityDetected?: (type: string, time: Date) => void
}

export function CameraFeed({ onMotionDetected, onObjectDetected, onActivityDetected }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const motionDetectorRef = useRef(new MotionDetector())
  const objectDetectorRef = useRef(new SimpleObjectDetector())
  const lastAlertTimeRef = useRef<{ motion: number; object: number }>({
    motion: 0,
    object: 0,
  })

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsRunning(true)
        }
      } catch (err) {
        setError("Unable to access camera")
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!isRunning || !videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const detectFrame = () => {
      context.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height)

      // Motion detection
      const motion = motionDetectorRef.current.detectMotion(canvas, context)
      if (motion.hasMotion) {
        onMotionDetected?.(motion.motionLevel)

        const now = Date.now()
        if (now - lastAlertTimeRef.current.motion > 1000) {
          onActivityDetected?.("motion", new Date())
          lastAlertTimeRef.current.motion = now
        }
      }

      // Object detection
      const object = objectDetectorRef.current.detectObjects(canvas, context)
      if (object.detected) {
        onObjectDetected?.(object.confidence)

        const now = Date.now()
        if (now - lastAlertTimeRef.current.object > 2000) {
          onActivityDetected?.("object", new Date())
          lastAlertTimeRef.current.object = now
        }
      }

      // Draw detection overlay
      context.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height)

      if (motion.hasMotion) {
        context.strokeStyle = "#ff0000"
        context.lineWidth = 2
        context.strokeRect(0, 0, canvas.width, canvas.height)
      }

      if (object.detected) {
        context.fillStyle = "rgba(0, 255, 0, 0.1)"
        context.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Draw status text
      context.fillStyle = "#ffffff"
      context.font = "12px monospace"
      context.fillText(`Motion: ${motion.motionLevel}%`, 10, 20)
      context.fillText(`Object: ${Math.round(object.confidence)}%`, 10, 35)

      requestAnimationFrame(detectFrame)
    }

    detectFrame()
  }, [isRunning, onMotionDetected, onObjectDetected, onActivityDetected])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-900 text-white">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <video ref={videoRef} autoPlay playsInline className="hidden" style={{ width: 640, height: 480 }} />
      <canvas ref={canvasRef} width={640} height={480} className="w-full border border-gray-700 rounded-lg bg-black" />
      <p className="text-xs text-gray-500">Live camera feed with detection overlay</p>
    </div>
  )
}

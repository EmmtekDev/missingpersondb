"use client"

import { useEffect, useRef, useState } from "react"
import { MotionDetector, SimpleObjectDetector } from "@/utils/motion-detection"
import { FaceDetector, type Region } from "@/utils/face-detection"

interface CameraFeedProps {
  onMotionDetected?: (level: number) => void
  onObjectDetected?: (confidence: number) => void
  onActivityDetected?: (type: string, time: Date) => void
  onFaceDetected?: (regions: Region[], confidence: number) => void
}

export function CameraFeed({
  onMotionDetected,
  onObjectDetected,
  onActivityDetected,
  onFaceDetected,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const motionDetectorRef = useRef(new MotionDetector())
  const objectDetectorRef = useRef(new SimpleObjectDetector())
  const faceDetectorRef = useRef(new FaceDetector())
  const lastAlertTimeRef = useRef<{ motion: number; object: number; face: number }>({
    motion: 0,
    object: 0,
    face: 0,
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
      if (videoRef.current!.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectFrame)
        return
      }
      
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

      const faces = faceDetectorRef.current.detectFaces(canvas, context)
      if (faces.detected) {
        onFaceDetected?.(faces.regions, faces.confidence)

        const now = Date.now()
        if (now - lastAlertTimeRef.current.face > 3000) {
          onActivityDetected?.("person", new Date())
          lastAlertTimeRef.current.face = now
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

      if (faces.detected && faces.regions.length > 0) {
        for (const region of faces.regions) {
          context.strokeStyle = "#ffff00"
          context.lineWidth = 2
          context.strokeRect(region.x, region.y, region.w, region.h)

          context.fillStyle = "rgba(255, 255, 0, 0.05)"
          context.fillRect(region.x, region.y, region.w, region.h)
        }
      }

      // Draw status text
      context.fillStyle = "#ffffff"
      context.font = "12px monospace"
      context.fillText(`Motion: ${motion.motionLevel}%`, 10, 20)
      context.fillText(`Object: ${Math.round(object.confidence)}%`, 10, 35)
      context.fillText(`Faces: ${faces.regions.length} (${Math.round(faces.confidence)}%)`, 10, 50)

      requestAnimationFrame(detectFrame)
    }

    detectFrame()
  }, [isRunning])

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
      <p className="text-xs text-gray-500">Live camera feed with motion, object, and face detection overlay</p>
    </div>
  )
}

// Motion detection using canvas frame comparison
export class MotionDetector {
  private previousFrame: ImageData | null = null
  private sensitivityThreshold = 15
  private areaThreshold = 0.02

  detectMotion(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ): { hasMotion: boolean; motionLevel: number; regions: Uint8ClampedArray } {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let motionPixels = 0
    const changedPixels = new Uint8ClampedArray(canvas.width * canvas.height)

    if (this.previousFrame) {
      const prevData = this.previousFrame.data
      for (let i = 0; i < data.length; i += 4) {
        const rdiff = Math.abs(data[i] - prevData[i])
        const gdiff = Math.abs(data[i + 1] - prevData[i + 1])
        const bdiff = Math.abs(data[i + 2] - prevData[i + 2])
        const diff = (rdiff + gdiff + bdiff) / 3

        if (diff > this.sensitivityThreshold) {
          motionPixels++
          changedPixels[i / 4] = 255
        }
      }
    }

    this.previousFrame = imageData

    const motionArea = motionPixels / (canvas.width * canvas.height)
    const hasMotion = motionArea > this.areaThreshold
    const motionLevel = Math.min(100, Math.round(motionArea * 5000))

    return { hasMotion, motionLevel, regions: changedPixels }
  }

  setSensitivity(level: number) {
    this.sensitivityThreshold = Math.max(5, Math.min(50, level))
  }
}

// Simple object detection using brightness/contrast analysis
export class SimpleObjectDetector {
  detectObjects(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ): { detected: boolean; confidence: number } {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let brightness = 0
    let contrast = 0
    const pixelBrightness: number[] = []

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const grey = (r + g + b) / 3
      pixelBrightness.push(grey)
      brightness += grey
    }

    brightness = brightness / pixelBrightness.length

    const variance = pixelBrightness.reduce((sum, b) => sum + Math.pow(b - brightness, 2), 0)
    contrast = Math.sqrt(variance / pixelBrightness.length)

    // Objects typically have higher contrast
    const detected = contrast > 30 && brightness > 50
    const confidence = Math.min(100, (contrast / 50) * 100)

    return { detected, confidence }
  }
}

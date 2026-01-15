// Simple face detection using brightness/color patterns
export class FaceDetector {
  private detectionHistory: Array<{ regions: Region[]; timestamp: Date }> = []
  private maxHistorySize = 30

  detectFaces(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
  ): { detected: boolean; regions: Region[]; confidence: number } {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const regions = this.findSkinToneRegions(data, canvas.width, canvas.height)
    const detectionConfidence = this.calculateConfidence(regions, canvas.width, canvas.height)

    this.detectionHistory.unshift({ regions, timestamp: new Date() })
    if (this.detectionHistory.length > this.maxHistorySize) {
      this.detectionHistory.pop()
    }

    return {
      detected: regions.length > 0,
      regions,
      confidence: detectionConfidence,
    }
  }

  private findSkinToneRegions(data: Uint8ClampedArray, width: number, height: number): Region[] {
    const regions: Region[] = []
    const visited = new Uint8Array(width * height)
    const minRegionSize = 100

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4
      if (visited[pixelIndex]) continue

      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Skin tone detection: higher red, moderate green, lower blue
      if (this.isSkinTone(r, g, b)) {
        const region = this.floodFill(data, width, height, pixelIndex, visited)
        if (region.pixelCount > minRegionSize) {
          regions.push(region)
        }
      }
    }

    return this.mergeCloseRegions(regions)
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    const rg = r - g
    const rb = r - b
    return r > 95 && g > 40 && b > 20 && rg > 15 && rb > 15 && r > g && r > b && Math.abs(r - g) < 60
  }

  private floodFill(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startIndex: number,
    visited: Uint8Array,
  ): Region {
    const stack = [startIndex]
    const region: Region = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY, w: 0, h: 0, pixelCount: 0 }
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY

    while (stack.length > 0) {
      const pixelIndex = stack.pop()!
      if (visited[pixelIndex]) continue

      visited[pixelIndex] = 1
      region.pixelCount++

      const y = Math.floor(pixelIndex / width)
      const x = pixelIndex % width

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)

      const r = data[pixelIndex * 4]
      const g = data[pixelIndex * 4 + 1]
      const b = data[pixelIndex * 4 + 2]

      // Check neighbors
      const neighbors = [pixelIndex - width, pixelIndex + width, pixelIndex - 1, pixelIndex + 1]

      for (const neighbor of neighbors) {
        if (neighbor >= 0 && neighbor < width * height && !visited[neighbor]) {
          const nr = data[neighbor * 4]
          const ng = data[neighbor * 4 + 1]
          const nb = data[neighbor * 4 + 2]
          if (this.isSkinTone(nr, ng, nb)) {
            stack.push(neighbor)
          }
        }
      }
    }

    region.x = minX
    region.y = minY
    region.w = maxX - minX + 1
    region.h = maxY - minY + 1

    return region
  }

  private mergeCloseRegions(regions: Region[]): Region[] {
    if (regions.length === 0) return []

    const merged: Region[] = [regions[0]]

    for (let i = 1; i < regions.length; i++) {
      const current = regions[i]
      let merged_flag = false

      for (const existing of merged) {
        const dx = existing.x + existing.w / 2 - (current.x + current.w / 2)
        const dy = existing.y + existing.h / 2 - (current.y + current.h / 2)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 60) {
          existing.x = Math.min(existing.x, current.x)
          existing.y = Math.min(existing.y, current.y)
          existing.w = Math.max(existing.x + existing.w, current.x + current.w) - existing.x
          existing.h = Math.max(existing.y + existing.h, current.y + current.h) - existing.y
          existing.pixelCount += current.pixelCount
          merged_flag = true
          break
        }
      }

      if (!merged_flag) {
        merged.push(current)
      }
    }

    return merged
  }

  private calculateConfidence(regions: Region[], width: number, height: number): number {
    if (regions.length === 0) return 0

    let totalConfidence = 0
    for (const region of regions) {
      const sizeRatio = (region.w * region.h) / (width * height)
      const pixelDensity = region.pixelCount / (region.w * region.h)
      const confidence = Math.min(100, sizeRatio * 10000 + pixelDensity * 50)
      totalConfidence += confidence
    }

    return Math.min(100, totalConfidence / regions.length)
  }

  getDetectionHistory() {
    return this.detectionHistory
  }

  isPersonPresent(): boolean {
    if (this.detectionHistory.length < 3) return false
    const recentDetections = this.detectionHistory.slice(0, 3)
    return recentDetections.every((d) => d.regions.length > 0)
  }
}

export interface Region {
  x: number
  y: number
  w: number
  h: number
  pixelCount: number
}

// Simple face matching based on region similarity
export class FaceMatcherDemo {
  matchFaceToTarget(detectedRegion: Region, targetRegion: Region): number {
    const areaRatio =
      Math.min(detectedRegion.w * detectedRegion.h, targetRegion.w * targetRegion.h) /
      Math.max(detectedRegion.w * detectedRegion.h, targetRegion.w * targetRegion.h)

    const sizeMatch = areaRatio > 0.6 ? 100 * areaRatio : 50 * areaRatio

    // Simulate confidence based on size similarity (in real scenario, would use ML model)
    return Math.round(Math.min(100, sizeMatch + Math.random() * 20))
  }
}

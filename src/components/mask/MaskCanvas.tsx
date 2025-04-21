import { useRef, useEffect, useState } from 'react'
import { MaskRect } from '../../store/imageStore'

interface MaskCanvasProps {
  imageUrl: string
  maskRects: MaskRect[]
  onAddRect: (rect: MaskRect) => void
  onUpdateRect: (id: string, rect: Partial<MaskRect>) => void
  onRemoveRect: (id: string) => void
  readOnly?: boolean
}

// Generate a unique ID for rectangles
const generateId = () => `rect_${Math.random().toString(36).substr(2, 9)}`

const MaskCanvas = ({
  imageUrl,
  maskRects,
  onAddRect,
  onUpdateRect,
  onRemoveRect,
  readOnly = false,
}: MaskCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [selectedRectId, setSelectedRectId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  
  // Image reference for drawing
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Initialize image
  useEffect(() => {
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      
      // Calculate scale to fit in the canvas container
      const containerWidth = canvasRef.current?.parentElement?.clientWidth || 800
      const scale = containerWidth / img.width
      
      // Set canvas size
      setCanvasSize({
        width: img.width * scale,
        height: img.height * scale,
      })
      setScale(scale)
    }
  }, [imageUrl])

  // Draw everything when needed
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // Draw existing rectangles
    maskRects.forEach((rect) => {
      const isSelected = rect.id === selectedRectId
      
      // Highlight selected rectangle
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#ef4444'
      ctx.lineWidth = isSelected ? 3 : 2
      
      // For readOnly mode, fill with semi-transparent red
      if (readOnly) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
        ctx.fillRect(
          rect.x * scale,
          rect.y * scale,
          rect.width * scale,
          rect.height * scale
        )
      }
      
      // Draw rectangle border
      ctx.strokeRect(
        rect.x * scale,
        rect.y * scale,
        rect.width * scale,
        rect.height * scale
      )
    })
  }, [imageLoaded, maskRects, selectedRectId, scale, readOnly])

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    // Get the mouse position relative to canvas
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    // Check if clicked on an existing rectangle
    const clickedRect = maskRects.find(
      (r) =>
        x >= r.x &&
        x <= r.x + r.width &&
        y >= r.y &&
        y <= r.y + r.height
    )

    if (clickedRect) {
      setSelectedRectId(clickedRect.id)
      setDragStart({ x, y })
      setIsDragging(true)
    } else {
      // Start drawing a new rectangle
      setIsDrawing(true)
      setStartPoint({ x, y })
      setSelectedRectId(null)
    }
  }

  // Handle mouse move event
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    // Get the mouse position relative to canvas
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    if (isDrawing && startPoint) {
      // We're creating a new rectangle
      const width = x - startPoint.x
      const height = y - startPoint.y

      // Re-draw everything with the temporary rectangle
      const ctx = canvas.getContext('2d')
      if (!ctx || !imageRef.current) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

      // Draw existing rectangles
      maskRects.forEach((rect) => {
        ctx.strokeStyle = rect.id === selectedRectId ? '#3b82f6' : '#ef4444'
        ctx.lineWidth = rect.id === selectedRectId ? 3 : 2
        ctx.strokeRect(
          rect.x * scale,
          rect.y * scale,
          rect.width * scale,
          rect.height * scale
        )
      })

      // Draw the new rectangle being created
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.strokeRect(
        startPoint.x * scale,
        startPoint.y * scale,
        width * scale,
        height * scale
      )
    } else if (isDragging && dragStart && selectedRectId) {
      // We're moving an existing rectangle
      const selectedRect = maskRects.find((r) => r.id === selectedRectId)
      if (!selectedRect) return

      const dx = x - dragStart.x
      const dy = y - dragStart.y

      // Update the rectangle position
      onUpdateRect(selectedRectId, {
        x: selectedRect.x + dx,
        y: selectedRect.y + dy,
      })

      // Update the drag start point
      setDragStart({ x, y })
    }
  }

  // Handle mouse up event
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return
    
    if (isDrawing && startPoint) {
      const canvas = canvasRef.current
      if (!canvas) return

      // Get the mouse position relative to canvas
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale

      // Calculate the rectangle dimensions
      const width = Math.abs(x - startPoint.x)
      const height = Math.abs(y - startPoint.y)
      const left = Math.min(startPoint.x, x)
      const top = Math.min(startPoint.y, y)

      // Only add if it has a meaningful size
      if (width > 5 && height > 5) {
        const newRect: MaskRect = {
          id: generateId(),
          x: left,
          y: top,
          width,
          height,
        }
        onAddRect(newRect)
      }
    }

    // Reset states
    setIsDrawing(false)
    setStartPoint(null)
    setIsDragging(false)
    setDragStart(null)
  }

  // Handle key down to delete selected rectangle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRectId) {
        onRemoveRect(selectedRectId)
        setSelectedRectId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedRectId, onRemoveRect])

  return (
    <div className="relative w-full overflow-auto">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`border border-gray-300 ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
      />
      {!readOnly && (
        <div className="mt-2 text-sm text-secondary-500">
          {selectedRectId 
            ? '選択中の領域: 矢印キーで移動、Delete キーで削除' 
            : 'マスキングする領域をドラッグして選択してください'}
        </div>
      )}
    </div>
  )
}

export default MaskCanvas

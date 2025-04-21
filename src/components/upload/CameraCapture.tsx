import { useRef, useState, useEffect } from 'react'
import { FiCamera, FiRotateCw, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Button from '../ui/Button'

interface CameraCaptureProps {
  onImageCaptured: (imageDataUrl: string, dimensions: { width: number; height: number }) => void
  onClose: () => void
}

const CameraCapture = ({ onImageCaptured, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          })
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
            setStream(mediaStream)
            setIsCameraReady(true)
          }
        } else {
          toast.error('お使いのブラウザはカメラをサポートしていません')
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        toast.error('カメラへのアクセスに失敗しました')
      }
    }

    startCamera()

    // Clean up function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [facingMode])

  const switchCamera = () => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    // Toggle facing mode
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageDataUrl)
      }
    }
  }

  const confirmImage = () => {
    if (capturedImage && canvasRef.current) {
      onImageCaptured(capturedImage, {
        width: canvasRef.current.width,
        height: canvasRef.current.height,
      })
    }
  }

  const retakeImage = () => {
    setCapturedImage(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col">
      <div className="p-4 bg-secondary-900 text-white flex justify-between items-center">
        <h2 className="text-lg font-medium">カメラキャプチャ</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          icon={<FiX />}
          aria-label="閉じる"
        >
          閉じる
        </Button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-black">
        {!capturedImage ? (
          <>
            <div className="relative w-full max-w-xl overflow-hidden rounded-lg border-4 border-secondary-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 flex space-x-4">
              <Button
                onClick={switchCamera}
                variant="secondary"
                disabled={!isCameraReady}
                icon={<FiRotateCw />}
              >
                カメラ切替
              </Button>
              <Button
                onClick={captureImage}
                variant="primary"
                disabled={!isCameraReady}
                icon={<FiCamera />}
              >
                撮影
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-full max-w-xl overflow-hidden rounded-lg border-4 border-secondary-800">
              <img src={capturedImage} alt="Captured" className="w-full h-auto" />
            </div>
            <div className="mt-4 flex space-x-4">
              <Button onClick={retakeImage} variant="secondary" icon={<FiX />}>
                撮り直す
              </Button>
              <Button onClick={confirmImage} variant="primary" icon={<FiCheck />}>
                この画像を使用
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default CameraCapture

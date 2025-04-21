import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCamera } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useImageStore } from '../store/imageStore'
import DropZone from '../components/upload/DropZone'
import CameraCapture from '../components/upload/CameraCapture'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const UploadPage = () => {
  const navigate = useNavigate()
  const [showCamera, setShowCamera] = useState(false)
  const { setOriginalImage } = useImageStore()

  const handleImageSelected = (imageDataUrl: string, dimensions: { width: number; height: number }) => {
    try {
      // Store the image in the global state
      setOriginalImage(imageDataUrl, dimensions)
      
      // Navigate to the masking page
      toast.success('画像がアップロードされました')
      navigate('/mask')
    } catch (error) {
      console.error('Error handling selected image:', error)
      toast.error('画像の処理中にエラーが発生しました')
    }
  }

  const handleOpenCamera = () => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('お使いのブラウザはカメラをサポートしていません')
      return
    }
    
    setShowCamera(true)
  }

  const handleCloseCamera = () => {
    setShowCamera(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">問診票をアップロード</h1>
      
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium mb-2">問診票画像の取り込み</h2>
          <p className="text-secondary-600">
            問診票をアップロードして、個人情報の匿名化を行います
          </p>
        </div>
        
        <DropZone onImageSelected={handleImageSelected} />
        
        <div className="mt-6 text-center">
          <p className="mb-4 text-secondary-500">または</p>
          <Button
            onClick={handleOpenCamera}
            variant="secondary"
            icon={<FiCamera />}
          >
            カメラで撮影
          </Button>
        </div>
      </Card>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">使い方</h3>
        <ol className="space-y-2 list-decimal pl-5">
          <li className="text-secondary-700">
            問診票をアップロードまたはカメラで撮影します
          </li>
          <li className="text-secondary-700">
            個人情報（氏名、保険証番号など）を自動検出し、マスキングします
          </li>
          <li className="text-secondary-700">
            Azure Document Intelligence でOCR処理を行います
          </li>
          <li className="text-secondary-700">
            電子カルテ用テンプレートを生成して提供します
          </li>
        </ol>
      </div>
      
      {showCamera && (
        <CameraCapture
          onImageCaptured={handleImageSelected}
          onClose={handleCloseCamera}
        />
      )}
    </div>
  )
}

export default UploadPage

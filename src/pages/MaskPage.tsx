import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiRefreshCw, FiShield } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useImageStore } from '../store/imageStore'
import { detectPersonalInfoRegions, applyMasking } from '../services/anonymizerService'
import MaskCanvas from '../components/mask/MaskCanvas'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const MaskPage = () => {
  const navigate = useNavigate()
  const { 
    originalImage, 
    originalImageDimensions,
    maskRects, 
    setMaskRects,
    addMaskRect,
    updateMaskRect,
    removeMaskRect,
    setMaskedImage
  } = useImageStore()
  const [isDetecting, setIsDetecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Redirect if we don't have an original image
  useEffect(() => {
    if (!originalImage) {
      toast.info('まず問診票をアップロードしてください')
      navigate('/upload')
    }
  }, [originalImage, navigate])
  
  // Auto-detect personal information regions on first load
  useEffect(() => {
    const detectRegions = async () => {
      if (originalImage && maskRects.length === 0) {
        setIsDetecting(true)
        try {
          const detectedRects = await detectPersonalInfoRegions(originalImage)
          setMaskRects(detectedRects)
          toast.info('個人情報と思われる領域を検出しました。必要に応じて調整してください。')
        } catch (error) {
          console.error('Error detecting personal info regions:', error)
          toast.error('個人情報の自動検出に失敗しました。手動でマスキングしてください。')
        } finally {
          setIsDetecting(false)
        }
      }
    }
    
    detectRegions()
  }, [originalImage, maskRects.length, setMaskRects])
  
  const handleRunDetection = async () => {
    if (!originalImage) return
    
    setIsDetecting(true)
    try {
      const detectedRects = await detectPersonalInfoRegions(originalImage)
      setMaskRects(detectedRects)
      toast.success('個人情報と思われる領域を検出しました')
    } catch (error) {
      console.error('Error detecting personal info regions:', error)
      toast.error('個人情報の自動検出に失敗しました')
    } finally {
      setIsDetecting(false)
    }
  }
  
  const handleContinue = async () => {
    if (!originalImage) return
    
    setIsProcessing(true)
    try {
      // Apply masking to the image
      const maskedImageUrl = await applyMasking(originalImage, maskRects)
      
      // Store the masked image
      setMaskedImage(maskedImageUrl)
      
      // Navigate to the OCR page
      navigate('/ocr')
    } catch (error) {
      console.error('Error applying masking:', error)
      toast.error('マスキングの適用に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleBack = () => {
    navigate('/upload')
  }
  
  if (!originalImage || !originalImageDimensions) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">個人情報のマスキング</h1>
      
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium mb-2">個人情報を確認・マスキング</h2>
          <p className="text-secondary-600">
            赤い枠内の情報はマスキングされます。枠の追加・削除・移動ができます。
          </p>
        </div>
        
        <div className="mb-4">
          <MaskCanvas
            imageUrl={originalImage}
            maskRects={maskRects}
            onAddRect={addMaskRect}
            onUpdateRect={updateMaskRect}
            onRemoveRect={removeMaskRect}
          />
        </div>
        
        <div className="flex flex-wrap gap-4 justify-between mt-6">
          <Button
            onClick={handleRunDetection}
            variant="secondary"
            isLoading={isDetecting}
            icon={<FiRefreshCw />}
          >
            再検出
          </Button>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleBack}
              variant="outline"
              icon={<FiArrowLeft />}
            >
              戻る
            </Button>
            
            <Button
              onClick={handleContinue}
              isLoading={isProcessing}
              icon={<FiArrowRight />}
            >
              続ける
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">個人情報マスキングについて</h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiShield className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">
                マスキングされた個人情報はクラウドに送信されません。マスキングした画像のみがOCR処理のためにAzureに送信されます。
              </p>
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-2 list-disc pl-5">
          <li className="text-secondary-700">
            氏名、住所、保険証番号などの個人情報は自動検出されます
          </li>
          <li className="text-secondary-700">
            自動検出に失敗した場合は、手動で枠を追加してください
          </li>
          <li className="text-secondary-700">
            選択した枠は削除キーで削除できます
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MaskPage

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiFileText, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useImageStore } from '../store/imageStore'
import { useSettingsStore } from '../store/settingsStore'
import { analyzeDocument } from '../services/azureDocumentService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const OcrPage = () => {
  const navigate = useNavigate()
  const { 
    maskedImage, 
    ocrJson, 
    ocrStatus, 
    ocrError,
    setOcrJson,
    setOcrStatus,
    setOcrError 
  } = useImageStore()
  const {
    azureDocumentEndpoint,
    azureDocumentKey,
    azureDocumentModelId
  } = useSettingsStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Redirect if we don't have a masked image
  useEffect(() => {
    if (!maskedImage) {
      toast.info('まず問診票をマスキングしてください')
      navigate('/mask')
    }
  }, [maskedImage, navigate])
  
  // Check if Azure settings are available
  const isAzureConfigured = !!(
    azureDocumentEndpoint && 
    azureDocumentKey && 
    azureDocumentModelId
  )
  
  // Process OCR when mounted if settings are available
  useEffect(() => {
    const processOcr = async () => {
      if (maskedImage && isAzureConfigured && ocrStatus === 'idle') {
        handleRunOcr()
      }
    }
    
    processOcr()
  }, [maskedImage, isAzureConfigured, ocrStatus])
  
  const handleRunOcr = async () => {
    if (!maskedImage || !isAzureConfigured) return
    
    setIsProcessing(true)
    setOcrStatus('loading')
    setOcrError(null)
    
    try {
      // Convert data URL to Blob
      const response = await fetch(maskedImage)
      const blob = await response.blob()
      
      // Run OCR analysis
      const result = await analyzeDocument(blob, {
        endpoint: azureDocumentEndpoint,
        key: azureDocumentKey,
        modelId: azureDocumentModelId,
      })
      
      // Store the OCR result
      setOcrJson(result)
      setOcrStatus('success')
      toast.success('OCR処理が完了しました')
    } catch (error) {
      console.error('Error running OCR:', error)
      let errorMessage = 'OCR処理に失敗しました'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setOcrError(errorMessage)
      setOcrStatus('error')
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleContinue = () => {
    if (ocrJson) {
      navigate('/preview')
    } else {
      toast.error('OCRが完了していません')
    }
  }
  
  const handleBack = () => {
    navigate('/mask')
  }
  
  if (!maskedImage) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }
  
  // Handle when Azure is not configured
  if (!isAzureConfigured) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OCR処理</h1>
        
        <Card>
          <div className="text-center mb-6">
            <FiAlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-medium mt-4 mb-2">Azure 設定が必要です</h2>
            <p className="text-secondary-600">
              OCR処理を行うには、Azure Document Intelligence の設定が必要です。
            </p>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => navigate('/settings')}
              variant="primary"
              icon={<FiFileText />}
            >
              設定画面へ移動
            </Button>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OCR処理</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium mb-2">マスク後の画像</h2>
            <p className="text-secondary-600">
              個人情報がマスクされた画像です
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img 
              src={maskedImage} 
              alt="Masked document" 
              className="w-full h-auto"
            />
          </div>
        </Card>
        
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium mb-2">OCR結果</h2>
            <p className="text-secondary-600">
              Azure Document Intelligence による解析結果
            </p>
          </div>
          
          {ocrStatus === 'loading' && (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-secondary-600">OCR処理中...</p>
            </div>
          )}
          
          {ocrStatus === 'error' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiAlertCircle className="h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-medium text-red-700">OCR処理に失敗しました</h3>
              <p className="mt-2 text-red-600">{ocrError}</p>
              <Button
                onClick={handleRunOcr}
                variant="primary"
                className="mt-4"
                isLoading={isProcessing}
              >
                再試行
              </Button>
            </div>
          )}
          
          {ocrStatus === 'success' && ocrJson && (
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 h-64 overflow-auto">
              <pre className="text-xs text-secondary-700 whitespace-pre-wrap">
                {JSON.stringify(ocrJson, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button
          onClick={handleBack}
          variant="outline"
          icon={<FiArrowLeft />}
        >
          戻る
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={ocrStatus !== 'success'}
          icon={<FiArrowRight />}
        >
          次へ
        </Button>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">OCR処理について</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li className="text-secondary-700">
            マスクされた画像はAzure Document Intelligenceに送信され、テキスト抽出が行われます
          </li>
          <li className="text-secondary-700">
            OCR処理には数秒から数十秒かかる場合があります
          </li>
          <li className="text-secondary-700">
            抽出されたテキストは次のステップでLLMによって整形されます
          </li>
        </ul>
      </div>
    </div>
  )
}

export default OcrPage

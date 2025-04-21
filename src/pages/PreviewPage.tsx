import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiClipboard, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useImageStore } from '../store/imageStore'
import { useSettingsStore } from '../store/settingsStore'
import { generateTemplate } from '../services/llmProvider'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const PreviewPage = () => {
  const navigate = useNavigate()
  const { 
    ocrJson, 
    formattedTemplate,
    editedTemplate,
    setFormattedTemplate,
    setEditedTemplate 
  } = useImageStore()
  const {
    activeLlmProvider,
    azureOpenAIEndpoint,
    azureOpenAIKey,
    azureOpenAIDeploymentName,
    ollamaEndpoint,
    ollamaModel
  } = useSettingsStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isReformatting, setIsReformatting] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Redirect if we don't have OCR results
  useEffect(() => {
    if (!ocrJson) {
      toast.info('まずOCR処理を行ってください')
      navigate('/ocr')
    }
  }, [ocrJson, navigate])
  
  // Check if LLM settings are available
  const isLlmConfigured = activeLlmProvider === 'azure' 
    ? !!(azureOpenAIEndpoint && azureOpenAIKey && azureOpenAIDeploymentName)
    : !!(ollamaEndpoint && ollamaModel)
  
  // Generate template when mounted if settings are available
  useEffect(() => {
    const generateTemplateOnMount = async () => {
      if (ocrJson && isLlmConfigured && !formattedTemplate) {
        handleGenerateTemplate()
      }
    }
    
    generateTemplateOnMount()
  }, [ocrJson, isLlmConfigured, formattedTemplate])
  
  const handleGenerateTemplate = async () => {
    if (!ocrJson || !isLlmConfigured) return
    
    setIsGenerating(true)
    
    try {
      // Configure LLM provider
      const config = {
        provider: activeLlmProvider,
        azureEndpoint: azureOpenAIEndpoint,
        azureKey: azureOpenAIKey,
        azureDeploymentName: azureOpenAIDeploymentName,
        ollamaEndpoint: ollamaEndpoint,
        ollamaModel: ollamaModel,
      }
      
      // Generate template
      const template = await generateTemplate(ocrJson, config)
      
      // Store the template
      setFormattedTemplate(template)
      toast.success('テンプレートの生成が完了しました')
    } catch (error) {
      console.error('Error generating template:', error)
      let errorMessage = 'テンプレートの生成に失敗しました'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleReformatTemplate = async () => {
    if (!ocrJson || !isLlmConfigured) return
    
    setIsReformatting(true)
    
    try {
      // Configure LLM provider
      const config = {
        provider: activeLlmProvider,
        azureEndpoint: azureOpenAIEndpoint,
        azureKey: azureOpenAIKey,
        azureDeploymentName: azureOpenAIDeploymentName,
        ollamaEndpoint: ollamaEndpoint,
        ollamaModel: ollamaModel,
      }
      
      // Generate template
      const template = await generateTemplate(ocrJson, config)
      
      // Store the template
      setFormattedTemplate(template)
      setEditedTemplate(template)
      toast.success('テンプレートを再生成しました')
    } catch (error) {
      console.error('Error reformatting template:', error)
      let errorMessage = 'テンプレートの再生成に失敗しました'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsReformatting(false)
    }
  }
  
  const handleCopyToClipboard = () => {
    if (!editedTemplate) return
    
    navigator.clipboard.writeText(editedTemplate)
      .then(() => {
        setCopied(true)
        toast.success('クリップボードにコピーしました')
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error) => {
        console.error('Failed to copy:', error)
        toast.error('コピーに失敗しました')
      })
  }
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedTemplate(e.target.value)
  }
  
  const handleBack = () => {
    navigate('/ocr')
  }
  
  if (!ocrJson) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }
  
  // Handle when LLM is not configured
  if (!isLlmConfigured) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">テンプレート生成</h1>
        
        <Card>
          <div className="text-center mb-6">
            <FiAlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-medium mt-4 mb-2">LLM設定が必要です</h2>
            <p className="text-secondary-600">
              テンプレート生成を行うには、LLM（Azure OpenAIまたはOllama）の設定が必要です。
            </p>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => navigate('/settings')}
              variant="primary"
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
      <h1 className="text-2xl font-bold mb-6">テンプレート生成・編集</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium mb-2">OCR結果</h2>
            <p className="text-secondary-600">
              Document Intelligenceによる解析結果
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 h-64 overflow-auto">
            <pre className="text-xs text-secondary-700 whitespace-pre-wrap">
              {ocrJson ? JSON.stringify(ocrJson, null, 2) : 'OCR結果がありません'}
            </pre>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleReformatTemplate}
              variant="secondary"
              size="sm"
              isLoading={isReformatting}
              icon={<FiRefreshCw />}
            >
              テンプレート再生成
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium mb-2">カルテ貼付用テンプレート</h2>
            <p className="text-secondary-600">
              LLMによる整形結果（編集可能）
            </p>
          </div>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-secondary-600">テンプレート生成中...</p>
            </div>
          ) : editedTemplate ? (
            <div className="mb-4">
              <textarea
                ref={textareaRef}
                value={editedTemplate}
                onChange={handleTextChange}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FiAlertCircle className="h-12 w-12 text-amber-500" />
              <h3 className="mt-4 text-lg font-medium text-amber-700">テンプレートがありません</h3>
              <Button
                onClick={handleGenerateTemplate}
                variant="primary"
                className="mt-4"
                isLoading={isGenerating}
              >
                テンプレート生成
              </Button>
            </div>
          )}
          
          {editedTemplate && (
            <div className="flex justify-center">
              <Button
                onClick={handleCopyToClipboard}
                variant="primary"
                fullWidth
                icon={copied ? <FiCheck /> : <FiClipboard />}
              >
                {copied ? 'コピーしました' : 'クリップボードにコピー'}
              </Button>
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
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">テンプレート生成について</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li className="text-secondary-700">
            OCR結果をLLMに送信し、カルテに貼り付けやすい形式に整形しています
          </li>
          <li className="text-secondary-700">
            テンプレートは自由に編集できます
          </li>
          <li className="text-secondary-700">
            「コピー」ボタンでクリップボードにコピーし、カルテに貼り付けられます
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PreviewPage

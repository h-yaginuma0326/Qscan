import { useState } from 'react'
import { FiSave, FiShield, FiKey, FiDatabase, FiServer } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useSettingsStore, LlmProvider } from '../store/settingsStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const SettingsPage = () => {
  const {
    azureDocumentEndpoint,
    azureDocumentKey,
    azureDocumentModelId,
    azureOpenAIEndpoint,
    azureOpenAIKey,
    azureOpenAIDeploymentName,
    ollamaEndpoint,
    ollamaModel,
    activeLlmProvider,
    setAzureDocumentSettings,
    setAzureOpenAISettings,
    setOllamaSettings,
    setActiveLlmProvider,
  } = useSettingsStore()

  // Form state
  const [docEndpoint, setDocEndpoint] = useState(azureDocumentEndpoint)
  const [docKey, setDocKey] = useState(azureDocumentKey)
  const [docModelId, setDocModelId] = useState(azureDocumentModelId)
  const [openaiEndpoint, setOpenaiEndpoint] = useState(azureOpenAIEndpoint)
  const [openaiKey, setOpenaiKey] = useState(azureOpenAIKey)
  const [openaiDeployment, setOpenaiDeployment] = useState(azureOpenAIDeploymentName)
  const [ollamaUrl, setOllamaUrl] = useState(ollamaEndpoint)
  const [ollamaModelName, setOllamaModelName] = useState(ollamaModel)
  const [llmProvider, setLlmProvider] = useState<LlmProvider>(activeLlmProvider)

  const handleSaveDocumentSettings = () => {
    setAzureDocumentSettings(docEndpoint, docKey, docModelId)
    toast.success('Azure Document Intelligence 設定を保存しました')
  }

  const handleSaveOpenAISettings = () => {
    setAzureOpenAISettings(openaiEndpoint, openaiKey, openaiDeployment)
    toast.success('Azure OpenAI 設定を保存しました')
  }

  const handleSaveOllamaSettings = () => {
    setOllamaSettings(ollamaUrl, ollamaModelName)
    toast.success('Ollama 設定を保存しました')
  }

  const handleSaveLlmProvider = () => {
    setActiveLlmProvider(llmProvider)
    toast.success(`テキスト生成プロバイダーを ${llmProvider === 'azure' ? 'Azure OpenAI' : 'Ollama'} に設定しました`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      <div className="space-y-8">
        <Card>
          <div className="flex items-center mb-4">
            <FiDatabase className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-medium ml-2">Azure Document Intelligence</h2>
          </div>
          <p className="text-secondary-600 mb-6">
            問診票のOCR処理に使用するAzure Document Intelligenceの設定
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="doc-endpoint" className="block text-sm font-medium text-secondary-700 mb-1">
                Endpoint URL
              </label>
              <input
                id="doc-endpoint"
                type="text"
                value={docEndpoint}
                onChange={(e) => setDocEndpoint(e.target.value)}
                placeholder="https://your-resource.cognitiveservices.azure.com/"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="doc-key" className="block text-sm font-medium text-secondary-700 mb-1">
                API Key
              </label>
              <input
                id="doc-key"
                type="password"
                value={docKey}
                onChange={(e) => setDocKey(e.target.value)}
                placeholder="API Key"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="doc-model-id" className="block text-sm font-medium text-secondary-700 mb-1">
                カスタムモデルID
              </label>
              <input
                id="doc-model-id"
                type="text"
                value={docModelId}
                onChange={(e) => setDocModelId(e.target.value)}
                placeholder="prebuilt-layout"
                className="input"
              />
            </div>

            <Button onClick={handleSaveDocumentSettings} icon={<FiSave />}>
              設定を保存
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <FiServer className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-medium ml-2">テキスト生成設定</h2>
          </div>
          <p className="text-secondary-600 mb-6">
            OCR結果からテンプレートを生成するためのLLM設定
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="llm-provider" className="block text-sm font-medium text-secondary-700 mb-1">
                使用するプロバイダー
              </label>
              <select
                id="llm-provider"
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value as LlmProvider)}
                className="input"
              >
                <option value="azure">Azure OpenAI</option>
                <option value="ollama">Ollama (ローカルLLM)</option>
              </select>

              <Button onClick={handleSaveLlmProvider} className="mt-2" icon={<FiSave />}>
                プロバイダー設定を保存
              </Button>
            </div>
          </div>
        </Card>

        {llmProvider === 'azure' && (
          <Card>
            <div className="flex items-center mb-4">
              <FiKey className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-medium ml-2">Azure OpenAI設定</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="openai-endpoint" className="block text-sm font-medium text-secondary-700 mb-1">
                  Endpoint URL
                </label>
                <input
                  id="openai-endpoint"
                  type="text"
                  value={openaiEndpoint}
                  onChange={(e) => setOpenaiEndpoint(e.target.value)}
                  placeholder="https://your-resource.openai.azure.com/"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="openai-key" className="block text-sm font-medium text-secondary-700 mb-1">
                  API Key
                </label>
                <input
                  id="openai-key"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="API Key"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="openai-deployment" className="block text-sm font-medium text-secondary-700 mb-1">
                  デプロイメント名
                </label>
                <input
                  id="openai-deployment"
                  type="text"
                  value={openaiDeployment}
                  onChange={(e) => setOpenaiDeployment(e.target.value)}
                  placeholder="gpt-4o"
                  className="input"
                />
              </div>

              <Button onClick={handleSaveOpenAISettings} icon={<FiSave />}>
                設定を保存
              </Button>
            </div>
          </Card>
        )}

        {llmProvider === 'ollama' && (
          <Card>
            <div className="flex items-center mb-4">
              <FiServer className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-medium ml-2">Ollama設定</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="ollama-endpoint" className="block text-sm font-medium text-secondary-700 mb-1">
                  Endpoint URL
                </label>
                <input
                  id="ollama-endpoint"
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="ollama-model" className="block text-sm font-medium text-secondary-700 mb-1">
                  モデル名
                </label>
                <input
                  id="ollama-model"
                  type="text"
                  value={ollamaModelName}
                  onChange={(e) => setOllamaModelName(e.target.value)}
                  placeholder="llama3-jp"
                  className="input"
                />
              </div>

              <Button onClick={handleSaveOllamaSettings} icon={<FiSave />}>
                設定を保存
              </Button>
            </div>
          </Card>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiShield className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>セキュリティ情報:</strong> 設定した認証情報はローカルのブラウザにのみ保存され、
                サーバーに送信されることはありません。IndexedDBに暗号化せずに保存されるため、
                共有PCでの使用には注意してください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

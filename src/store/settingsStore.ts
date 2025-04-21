import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LlmProvider = 'azure' | 'ollama'

interface SettingsState {
  // Azure Document Intelligence
  azureDocumentEndpoint: string
  azureDocumentKey: string
  azureDocumentModelId: string
  
  // Azure OpenAI
  azureOpenAIEndpoint: string
  azureOpenAIKey: string
  azureOpenAIDeploymentName: string
  
  // Ollama
  ollamaEndpoint: string
  ollamaModel: string
  
  // Active LLM provider
  activeLlmProvider: LlmProvider
  
  // Actions
  setAzureDocumentSettings: (endpoint: string, key: string, modelId: string) => void
  setAzureOpenAISettings: (endpoint: string, key: string, deploymentName: string) => void
  setOllamaSettings: (endpoint: string, model: string) => void
  setActiveLlmProvider: (provider: LlmProvider) => void
}

const initialState = {
  azureDocumentEndpoint: '',
  azureDocumentKey: '',
  azureDocumentModelId: '',
  
  azureOpenAIEndpoint: '',
  azureOpenAIKey: '',
  azureOpenAIDeploymentName: 'gpt-4o',
  
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3-jp',
  
  activeLlmProvider: 'azure' as LlmProvider,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAzureDocumentSettings: (endpoint, key, modelId) => set({
        azureDocumentEndpoint: endpoint,
        azureDocumentKey: key,
        azureDocumentModelId: modelId,
      }),
      
      setAzureOpenAISettings: (endpoint, key, deploymentName) => set({
        azureOpenAIEndpoint: endpoint,
        azureOpenAIKey: key,
        azureOpenAIDeploymentName: deploymentName,
      }),
      
      setOllamaSettings: (endpoint, model) => set({
        ollamaEndpoint: endpoint,
        ollamaModel: model,
      }),
      
      setActiveLlmProvider: (provider) => set({
        activeLlmProvider: provider,
      }),
    }),
    {
      name: 'windsurf-settings-storage',
    }
  )
)

import axios from 'axios';
import { toast } from 'react-toastify';
import { LlmProvider } from '../store/settingsStore';

interface LlmConfig {
  provider: LlmProvider;
  azureEndpoint?: string;
  azureKey?: string;
  azureDeploymentName?: string;
  ollamaEndpoint?: string;
  ollamaModel?: string;
}

const SYSTEM_PROMPT = `
あなたは医療クリニックのアシスタントです。問診票のOCR結果をもとに、電子カルテ用の整形されたテンプレートを作成してください。
以下のガイドラインに従ってください：

1. 問診票の主要な情報を抽出し、構造化された形式で表示する
2. 【】で囲まれた見出しを使用して異なるセクションを区切る
3. 症状の有無は (+) または (-) で表記する
4. 改行を適切に使用し、読みやすさを確保する
5. 箇条書きリストで情報を整理する
6. 元のデータに無い情報は推測せず、あくまでOCR結果の再構成に徹する

出力テンプレート例：
【主訴】発熱 38.2 ℃（1日前〜）
【随伴症状】咳・咽頭痛 (+)／息切れ (-)
【既往歴】高血圧
【服薬中】アムロジピン 5mg 1T 1×朝食後
【アレルギー】花粉症（スギ・ヒノキ）(+)／薬・食物 (-)
`;

/**
 * Generate a formatted template from OCR JSON using the configured LLM
 */
export const generateTemplate = async (
  ocrJson: Record<string, any>,
  config: LlmConfig
): Promise<string> => {
  try {
    // Validate configuration
    if (config.provider === 'azure') {
      if (!config.azureEndpoint || !config.azureKey || !config.azureDeploymentName) {
        throw new Error('Azure OpenAI configuration is incomplete');
      }
    } else if (config.provider === 'ollama') {
      if (!config.ollamaEndpoint || !config.ollamaModel) {
        throw new Error('Ollama configuration is incomplete');
      }
    }

    // Convert OCR JSON to string for the prompt
    const ocrJsonStr = JSON.stringify(ocrJson, null, 2);

    // Use the appropriate LLM provider
    let result: string;
    
    if (config.provider === 'azure') {
      result = await generateWithAzureOpenAI(ocrJsonStr, {
        endpoint: config.azureEndpoint!,
        key: config.azureKey!,
        deploymentName: config.azureDeploymentName!,
      });
    } else {
      result = await generateWithOllama(ocrJsonStr, {
        endpoint: config.ollamaEndpoint!,
        model: config.ollamaModel!,
      });
    }

    // Log the result for debugging
    saveToLogs('llm_template_generation', { provider: config.provider, result });
    
    return result;
  } catch (error) {
    console.error('Error generating template:', error);
    
    let errorMessage = 'Template generation failed';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Generate template using Azure OpenAI
 */
const generateWithAzureOpenAI = async (
  ocrJsonStr: string,
  config: { endpoint: string; key: string; deploymentName: string }
): Promise<string> => {
  // Format the endpoint URL correctly
  const baseEndpoint = config.endpoint.endsWith('/')
    ? config.endpoint.slice(0, -1)
    : config.endpoint;
  
  const url = `${baseEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
  
  const payload = {
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `以下の問診票OCR結果を整形してください：\n\n${ocrJsonStr}`
      }
    ],
    temperature: 0.1,
    max_tokens: 2000,
    top_p: 0.95,
    stream: false,
  };
  
  const response = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.key,
    }
  });
  
  return response.data.choices[0].message.content;
};

/**
 * Generate template using Ollama
 */
const generateWithOllama = async (
  ocrJsonStr: string,
  config: { endpoint: string; model: string }
): Promise<string> => {
  // Format the endpoint URL correctly
  const baseEndpoint = config.endpoint.endsWith('/')
    ? config.endpoint.slice(0, -1)
    : config.endpoint;
  
  const url = `${baseEndpoint}/api/chat`;
  
  const payload = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `以下の問診票OCR結果を整形してください：\n\n${ocrJsonStr}`
      }
    ],
    stream: false,
  };
  
  const response = await axios.post(url, payload);
  
  return response.data.message.content;
};

/**
 * Saves data to local logs for debugging
 */
const saveToLogs = (logType: string, data: any) => {
  try {
    // Create a log entry with timestamp
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: logType,
      data,
    };

    // Get existing logs from localStorage
    const logsJson = localStorage.getItem('windsurf-logs') || '[]';
    const logs = JSON.parse(logsJson);
    
    // Add the new log entry
    logs.push(logEntry);
    
    // Save back to localStorage, keeping only the last 10 logs
    const trimmedLogs = logs.slice(-10);
    localStorage.setItem('windsurf-logs', JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error saving to logs:', error);
  }
};

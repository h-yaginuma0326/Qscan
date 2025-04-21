import axios from 'axios';
import { toast } from 'react-toastify';

export interface AzureDocumentConfig {
  endpoint: string;
  modelId: string;
  key: string;
}

export interface AnalyzeResult {
  status: string;
  analyzeResult: Record<string, any>;
}

/**
 * Analyzes a document using Azure Document Intelligence
 * @param imageBlob The image blob to analyze
 * @param config Azure Document Intelligence configuration
 * @returns The analysis result
 */
export const analyzeDocument = async (
  imageBlob: Blob,
  config: AzureDocumentConfig
): Promise<Record<string, any>> => {
  if (!config.endpoint || !config.modelId || !config.key) {
    throw new Error('Azure Document Intelligence configuration is incomplete');
  }

  try {
    // Format the endpoint URL correctly
    const baseEndpoint = config.endpoint.endsWith('/')
      ? config.endpoint.slice(0, -1)
      : config.endpoint;
    
    const url = `${baseEndpoint}/documentModels/${config.modelId}:analyze?api-version=2024-05-01`;

    // Get the image content type
    const contentType = imageBlob.type || 'application/octet-stream';

    // Initial API call to start the analysis
    const response = await axios.post(
      url,
      imageBlob,
      {
        headers: {
          'Content-Type': contentType,
          'Ocp-Apim-Subscription-Key': config.key,
        }
      }
    );

    // Get the operation location from the response headers
    const operationLocation = response.headers['operation-location'];
    if (!operationLocation) {
      throw new Error('No operation location returned from Azure');
    }

    // Poll the operation until it completes
    let result: AnalyzeResult | null = null;
    let attempts = 0;
    const maxAttempts = 10;
    const delayBetweenPolls = 2000; // 2 seconds

    while (!result && attempts < maxAttempts) {
      attempts++;
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, delayBetweenPolls));

      // Poll for the result
      const pollResponse = await axios.get(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': config.key,
        }
      });

      const responseData = pollResponse.data;
      
      // Check if the operation has completed
      if (responseData.status === 'succeeded') {
        result = responseData;
        break;
      } else if (responseData.status === 'failed') {
        throw new Error(responseData.error?.message || 'Document analysis failed');
      }
      
      // If not succeeded or failed, continue polling
    }

    if (!result) {
      throw new Error('Document analysis timed out');
    }

    // Save the result to logs for debugging
    saveToLogs('azure_document_analysis', result);

    return result.analyzeResult;
  } catch (error) {
    console.error('Error analyzing document:', error);
    
    let errorMessage = 'Document analysis failed';
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
 * Saves data to local logs for debugging
 * @param logType The type of log
 * @param data The data to log
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

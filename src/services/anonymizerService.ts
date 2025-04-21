import { MaskRect } from '../store/imageStore';

/**
 * Applies masking to the image based on the provided rectangles
 * @param imageUrl The original image URL
 * @param maskRects The rectangles to mask
 * @param maskType The type of masking to apply ('blur' or 'solid')
 * @returns Promise resolving to a data URL of the masked image
 */
export const applyMasking = async (
  imageUrl: string,
  maskRects: MaskRect[],
  maskType: 'blur' | 'solid' = 'solid'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Create a canvas to draw the masked image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw the original image first
        ctx.drawImage(img, 0, 0);
        
        // Apply masking for each rectangle
        maskRects.forEach(rect => {
          if (maskType === 'solid') {
            // Fill with a solid color (black)
            ctx.fillStyle = '#000000';
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
          } else if (maskType === 'blur') {
            // For blur masking, we need to:
            // 1. Save the area to be blurred
            // 2. Apply blur filter
            // 3. Draw the blurred area back onto the canvas
            
            // Extract the image data from the region to be blurred
            const region = ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
            
            // Create a temporary canvas for the blur effect
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = rect.width;
            tempCanvas.height = rect.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
              reject(new Error('Failed to get temporary canvas context'));
              return;
            }
            
            // Put the extracted image data on the temporary canvas
            tempCtx.putImageData(region, 0, 0);
            
            // Apply blur filter
            tempCtx.filter = 'blur(10px)';
            tempCtx.drawImage(tempCanvas, 0, 0);
            
            // Draw the blurred area back onto the main canvas
            ctx.drawImage(tempCanvas, rect.x, rect.y);
          }
        });
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for masking'));
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Error applying masking:', error);
      reject(error);
    }
  });
};

/**
 * Detects potential personal information regions in an image using a simple method
 * In a production app, this would be replaced with CV.js and a proper ML model
 * @param imageUrl The image URL to analyze
 * @returns Promise resolving to an array of potential mask rectangles
 */
export const detectPersonalInfoRegions = async (imageUrl: string): Promise<MaskRect[]> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        // In a real implementation, this would use computer vision to detect:
        // - Text blocks that look like names (usually at the top of the form)
        // - Areas that might contain IDs or insurance numbers
        // - Patient-specific identifiers
        
        // For this demo, we'll create some placeholder rectangles
        // that would typically be detected by a CV algorithm
        
        // Name area detection (usually in the upper portion)
        const nameRect: MaskRect = {
          id: `rect_${Math.random().toString(36).substr(2, 9)}`,
          x: img.width * 0.1,  // 10% from left
          y: img.height * 0.05, // 5% from top
          width: img.width * 0.4, // 40% of image width
          height: img.height * 0.05, // 5% of image height
        };
        
        // ID/Insurance number detection (usually in the upper-middle portion)
        const idRect: MaskRect = {
          id: `rect_${Math.random().toString(36).substr(2, 9)}`,
          x: img.width * 0.6,  // 60% from left
          y: img.height * 0.05, // 5% from top
          width: img.width * 0.3, // 30% of image width
          height: img.height * 0.05, // 5% of image height
        };
        
        // Address detection (usually below name)
        const addressRect: MaskRect = {
          id: `rect_${Math.random().toString(36).substr(2, 9)}`,
          x: img.width * 0.1,  // 10% from left
          y: img.height * 0.12, // 12% from top
          width: img.width * 0.6, // 60% of image width
          height: img.height * 0.05, // 5% of image height
        };
        
        resolve([nameRect, idRect, addressRect]);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for analysis'));
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Error detecting personal info regions:', error);
      reject(error);
    }
  });
};

// Function to save log (shared with other services)
export const saveToLogs = (logType: string, data: any) => {
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

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MaskRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

interface ImageState {
  // Original image
  originalImage: string | null
  originalImageDimensions: { width: number; height: number } | null
  
  // Masked image
  maskedImage: string | null
  maskRects: MaskRect[]
  
  // OCR results
  ocrJson: Record<string, any> | null
  ocrStatus: 'idle' | 'loading' | 'success' | 'error'
  ocrError: string | null
  
  // Formatted template
  formattedTemplate: string | null
  editedTemplate: string | null
  
  // Actions
  setOriginalImage: (image: string, dimensions: { width: number; height: number }) => void
  setMaskedImage: (image: string) => void
  setMaskRects: (rects: MaskRect[]) => void
  addMaskRect: (rect: MaskRect) => void
  updateMaskRect: (id: string, rect: Partial<MaskRect>) => void
  removeMaskRect: (id: string) => void
  setOcrJson: (json: Record<string, any>) => void
  setOcrStatus: (status: 'idle' | 'loading' | 'success' | 'error') => void
  setOcrError: (error: string | null) => void
  setFormattedTemplate: (template: string) => void
  setEditedTemplate: (template: string) => void
  resetState: () => void
  resetFromStep: (step: 'upload' | 'mask' | 'ocr' | 'preview') => void
}

const initialState = {
  originalImage: null,
  originalImageDimensions: null,
  maskedImage: null,
  maskRects: [],
  ocrJson: null,
  ocrStatus: 'idle' as const,
  ocrError: null,
  formattedTemplate: null,
  editedTemplate: null,
}

export const useImageStore = create<ImageState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setOriginalImage: (image, dimensions) => set({ 
        originalImage: image,
        originalImageDimensions: dimensions,
        // Reset subsequent steps
        maskedImage: null,
        maskRects: [],
        ocrJson: null,
        ocrStatus: 'idle',
        ocrError: null,
        formattedTemplate: null,
        editedTemplate: null,
      }),
      
      setMaskedImage: (image) => set({ maskedImage: image }),
      
      setMaskRects: (rects) => set({ maskRects: rects }),
      
      addMaskRect: (rect) => set((state) => ({
        maskRects: [...state.maskRects, rect]
      })),
      
      updateMaskRect: (id, updatedRect) => set((state) => ({
        maskRects: state.maskRects.map(rect => 
          rect.id === id ? { ...rect, ...updatedRect } : rect
        )
      })),
      
      removeMaskRect: (id) => set((state) => ({
        maskRects: state.maskRects.filter(rect => rect.id !== id)
      })),
      
      setOcrJson: (json) => set({ 
        ocrJson: json,
        // Reset subsequent steps
        formattedTemplate: null,
        editedTemplate: null,
      }),
      
      setOcrStatus: (status) => set({ ocrStatus: status }),
      
      setOcrError: (error) => set({ ocrError: error }),
      
      setFormattedTemplate: (template) => set({ 
        formattedTemplate: template,
        editedTemplate: template, // Initialize edited with formatted
      }),
      
      setEditedTemplate: (template) => set({ editedTemplate: template }),
      
      resetState: () => set(initialState),
      
      resetFromStep: (step) => set((state) => {
        switch (step) {
          case 'upload':
            return initialState
          case 'mask':
            return {
              ...state,
              maskedImage: null,
              maskRects: [],
              ocrJson: null,
              ocrStatus: 'idle',
              ocrError: null,
              formattedTemplate: null,
              editedTemplate: null,
            }
          case 'ocr':
            return {
              ...state,
              ocrJson: null,
              ocrStatus: 'idle',
              ocrError: null,
              formattedTemplate: null,
              editedTemplate: null,
            }
          case 'preview':
            return {
              ...state,
              formattedTemplate: null,
              editedTemplate: null,
            }
          default:
            return state
        }
      }),
    }),
    {
      name: 'windsurf-image-storage',
    }
  )
)

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiImage, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Button from '../ui/Button'

interface DropZoneProps {
  onImageSelected: (imageDataUrl: string, dimensions: { width: number; height: number }) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png']

const DropZone = ({ onImageSelected }: DropZoneProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        if (acceptedFiles.length === 0) return

        setIsLoading(true)
        const file = acceptedFiles[0]

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error('ファイルサイズが大きすぎます (上限: 10MB)')
          return
        }

        // Convert file to data URL
        const reader = new FileReader()
        reader.onload = (event) => {
          const target = event.target;
          if (!target || !target.result) {
            toast.error('画像の読み込みに失敗しました')
            setIsLoading(false)
            return
          }

          const img = new Image()
          img.onload = () => {
            // Check image dimensions
            if (img.width * img.height > 8000000) { // 8MP limit
              toast.error('画像の解像度が高すぎます (上限: 8MP)')
              setIsLoading(false)
              return
            }

            // Pass the image data URL and dimensions to the parent component
            onImageSelected(target.result as string, { 
              width: img.width, 
              height: img.height 
            })
            setIsLoading(false)
          }
          img.onerror = () => {
            toast.error('画像の解析に失敗しました')
            setIsLoading(false)
          }
          img.src = target.result as string
        }
        reader.onerror = () => {
          toast.error('ファイルの読み込みに失敗しました')
          setIsLoading(false)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error loading image:', error)
        toast.error('画像の処理中にエラーが発生しました')
        setIsLoading(false)
      }
    },
    [onImageSelected]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
      } ${isDragReject ? 'border-red-500 bg-red-50' : ''} cursor-pointer transition-colors`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-300 border-t-primary-600"></div>
            <p className="mt-4 text-secondary-600">画像処理中...</p>
          </div>
        ) : isDragReject ? (
          <>
            <FiAlertCircle size={48} className="text-red-500" />
            <p className="text-red-600 font-medium">
              サポート対象外のファイル形式です
            </p>
            <p className="text-red-500 text-sm">
              画像ファイル (JPG, PNG) のみアップロード可能です
            </p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <FiImage size={48} className="text-primary-500" />
            ) : (
              <FiUpload size={48} className="text-secondary-400" />
            )}
            <p className="text-lg font-medium text-secondary-700">
              {isDragActive
                ? 'ここにドロップしてください'
                : '問診票画像をドラッグ＆ドロップ'}
            </p>
            <p className="text-secondary-500 text-sm">
              または
            </p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={(e) => e.stopPropagation()}
            >
              ファイルを選択
            </Button>
            <p className="text-secondary-400 text-xs mt-2">
              JPG, PNG - 最大 10MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default DropZone

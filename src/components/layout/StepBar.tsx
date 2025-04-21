import { useLocation } from 'react-router-dom'
import { FiUpload, FiEyeOff, FiFileText, FiEdit, FiCopy } from 'react-icons/fi'
import clsx from 'clsx'

const steps = [
  { id: 'upload', label: 'アップロード', path: '/upload', icon: FiUpload },
  { id: 'mask', label: 'マスキング', path: '/mask', icon: FiEyeOff },
  { id: 'ocr', label: 'OCR処理', path: '/ocr', icon: FiFileText },
  { id: 'preview', label: '整形・編集', path: '/preview', icon: FiEdit }
]

const StepBar = () => {
  const location = useLocation()
  const currentPath = location.pathname

  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.path === currentPath)
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon
            
            // Determine if this step is active, completed, or upcoming
            const isActive = step.path === currentPath
            const isCompleted = index < currentStepIndex
            const isUpcoming = index > currentStepIndex
            
            return (
              <div key={step.id} className="flex flex-1 items-center">
                {/* Line before first step is hidden */}
                {index > 0 && (
                  <div 
                    className={clsx(
                      "flex-grow h-px", 
                      isCompleted ? "bg-primary-500" : "bg-gray-300"
                    )}
                  />
                )}
                
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div 
                    className={clsx(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2",
                      isActive ? "bg-primary-100 border-primary-500 text-primary-600" :
                      isCompleted ? "bg-primary-500 border-primary-500 text-white" :
                      "bg-white border-gray-300 text-gray-400"
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  
                  {/* Step label */}
                  <span 
                    className={clsx(
                      "mt-2 text-xs font-medium",
                      isActive ? "text-primary-600" :
                      isCompleted ? "text-primary-500" :
                      "text-gray-500"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                
                {/* Line after last step is hidden */}
                {index < steps.length - 1 && (
                  <div 
                    className={clsx(
                      "flex-grow h-px",
                      index < currentStepIndex ? "bg-primary-500" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StepBar

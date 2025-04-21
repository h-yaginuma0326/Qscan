import clsx from 'clsx'

type SpinnerSize = 'small' | 'medium' | 'large'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  small: 'w-4 h-4 border-2',
  medium: 'w-8 h-8 border-3',
  large: 'w-12 h-12 border-4',
}

const LoadingSpinner = ({ size = 'medium', className }: LoadingSpinnerProps) => {
  return (
    <div className={clsx('flex justify-center items-center', className)}>
      <div 
        className={clsx(
          'animate-spin rounded-full border-solid border-primary-500 border-t-transparent',
          sizeClasses[size]
        )} 
      />
    </div>
  )
}

export default LoadingSpinner

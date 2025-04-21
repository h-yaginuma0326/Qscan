import { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import LoadingSpinner from './LoadingSpinner'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300 focus:ring-secondary-500',
  outline: 'bg-white border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled || isLoading ? 'opacity-70 cursor-not-allowed' : '',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? <LoadingSpinner size="small" /> : icon}
        {children}
      </div>
    </button>
  )
}

export default Button

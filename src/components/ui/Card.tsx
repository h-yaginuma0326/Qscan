import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  footer?: ReactNode
}

const Card = ({ children, className, title, footer }: CardProps) => {
  return (
    <div className={clsx('bg-white rounded-lg shadow', className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card

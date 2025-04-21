import { ReactNode } from 'react'
import Header from './Header'
import StepBar from './StepBar'
import { useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const showStepBar = !location.pathname.includes('/settings') && !location.pathname.includes('/404')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {showStepBar && <StepBar />}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-secondary-900 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          © {new Date().getFullYear()} Windsurf - たかぎ内科クリニック
        </div>
      </footer>
    </div>
  )
}

export default Layout

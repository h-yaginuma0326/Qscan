import { Link } from 'react-router-dom'
import { FiSettings } from 'react-icons/fi'

const Header = () => {
  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Windsurf
        </Link>
        <div className="flex items-center space-x-4">
          <Link 
            to="/settings" 
            className="p-2 rounded-full hover:bg-primary-700 transition-colors"
            title="設定"
          >
            <FiSettings size={24} />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header

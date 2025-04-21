import { Link } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'
import Button from '../components/ui/Button'

const NotFoundPage = () => {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <h1 className="text-9xl font-bold text-primary-600">404</h1>
      <h2 className="text-3xl font-semibold mt-8 mb-4 text-secondary-800">ページが見つかりません</h2>
      <p className="text-secondary-600 mb-8">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link to="/">
        <Button icon={<FiHome />}>
          ホームに戻る
        </Button>
      </Link>
    </div>
  )
}

export default NotFoundPage

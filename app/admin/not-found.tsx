import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gray-50  flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white  rounded-xl p-8 border border-gray-200  text-center">
        <h1 className="text-4xl font-bold text-gray-900  mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700  mb-4">Admin Page Not Found</h2>
        <p className="text-gray-600  mb-6">The admin page you're looking for doesn't exist.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200  text-gray-900  rounded-lg hover:bg-gray-300  transition-colors text-sm"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}


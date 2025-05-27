export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-20 px-4">
        <div className="container mx-auto">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-800 rounded w-32 mb-8"></div>

            {/* Search bar skeleton */}
            <div className="h-12 bg-gray-800 rounded mb-4"></div>

            {/* Filter skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="h-12 bg-gray-800 rounded"></div>
              <div className="h-12 bg-gray-800 rounded"></div>
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-4">
                  <div className="h-48 bg-gray-800 rounded mb-4"></div>
                  <div className="h-6 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-800 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

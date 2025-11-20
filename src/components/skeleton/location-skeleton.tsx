export function LocationSkeleton() {
  return (
    <div className="min-h-screen bg-[rgb(252,252,252)]">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full bg-gray-300 animate-pulse">
        {/* Title Overlay Placeholder */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="h-16 bg-gray-400 rounded w-96 mb-4 animate-pulse"></div>
            <div className="flex flex-wrap gap-4">
              <div className="h-10 bg-gray-400 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-400 rounded w-40 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              
              {/* Main Image */}
              <div className="relative h-96 rounded-lg overflow-hidden mb-4 bg-gray-300 animate-pulse"></div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative h-24 rounded-lg bg-gray-300 animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              
              {/* Map Placeholder */}
              <div className="relative h-96 rounded-lg bg-gray-300 animate-pulse mb-4"></div>

              {/* Address Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-gray-300 rounded flex-shrink-0 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse mt-2"></div>
                  </div>
                </div>
              </div>

              {/* Map Buttons */}
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Review Cards */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 flex-1">
                        <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="pb-4 border-b border-gray-100">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 bg-gray-300 rounded flex-shrink-0 animate-pulse mt-0.5"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Nearby Places */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

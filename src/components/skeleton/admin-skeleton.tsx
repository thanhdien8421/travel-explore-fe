"use client";

export function AdminSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
          <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48 mb-2"></div>
                  <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-64"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-40"></div>
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gray-100">
                      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
                
                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-16 mb-2"></div>
                      <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Rows Skeleton */}
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[25%]" />
                  </colgroup>
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {/* Image + Name + Description */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="ml-4 flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                              <div className="h-3 bg-gray-100 rounded animate-pulse w-40"></div>
                            </div>
                          </div>
                        </td>
                        {/* District */}
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16"></div>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <div className="h-8 bg-gray-100 rounded animate-pulse w-12"></div>
                            <div className="h-8 bg-gray-100 rounded animate-pulse w-12"></div>
                            <div className="h-8 bg-gray-100 rounded animate-pulse w-12"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Skeleton */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-100 rounded animate-pulse w-20"></div>
                  <div className="h-10 bg-gray-100 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

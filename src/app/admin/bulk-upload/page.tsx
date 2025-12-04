'use client';

import { useState } from 'react';
import AdminRouteGuard from '@/components/admin-route-guard';
import NavBar from '@/components/nav-bar';
import AdminSidebar from '@/components/admin-sidebar';
import { bulkUploadPlaces } from '@/lib/bulk-upload';

export default function BulkUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleBulkUpload = async () => {
    setIsUploading(true);
    setLog([]);
    
    // Override console.log to capture output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const captureLog = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLog(prev => [...prev, message]);
      originalLog(...args);
    };
    
    console.log = captureLog;
    console.error = captureLog;
    console.warn = captureLog;
    
    try {
      await bulkUploadPlaces();
    } catch (error) {
      console.error('Bulk upload failed:', error);
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsUploading(false);
    }
  };

  return (
    <AdminRouteGuard>
      <div className="h-screen flex flex-col overflow-hidden">
        <NavBar />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-[rgb(252,252,252)]" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <h1 
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Tải lên hàng loạt
                </h1>
                <p className="text-gray-600">
                  Tải lên nhiều địa điểm cùng lúc từ dữ liệu có sẵn
                </p>
              </div>
              
              {/* Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                <h2 
                  className="text-xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Quy trình tải lên
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-6">
                  <li className="flex gap-2">
                    <span className="text-gray-900 font-medium">1.</span>
                    <span>Tải hình ảnh từ các URL Wikipedia (trình duyệt xử lý CORS tốt hơn)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-900 font-medium">2.</span>
                    <span>Upload hình ảnh lên Supabase Storage</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-900 font-medium">3.</span>
                    <span>Tạo địa điểm trong database qua backend API</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-900 font-medium">4.</span>
                    <span>Hiển thị tiến trình theo thời gian thực</span>
                  </li>
                </ol>
                
                <button
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isUploading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Bắt đầu tải lên
                    </>
                  )}
                </button>
              </div>

              {/* Log Output */}
              {log.length > 0 && (
                <div className="bg-gray-900 text-green-400 rounded-lg shadow-sm p-6 font-mono text-sm overflow-auto max-h-[500px]">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400 ml-2">Console Output</span>
                  </div>
                  {log.map((line, index) => (
                    <div key={index} className="mb-1 leading-relaxed">
                      <span className="text-gray-500 mr-2">{`>`}</span>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}

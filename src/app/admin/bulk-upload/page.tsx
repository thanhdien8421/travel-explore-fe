'use client';

import { useState } from 'react';
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
    
    const captureLog = (...args: any[]) => {
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bulk Upload Places</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This utility will:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
            <li>Download images from Wikipedia URLs (browser handles CORS better)</li>
            <li>Upload images to Supabase Storage</li>
            <li>Create places in the database via the backend API</li>
            <li>Show progress in real-time</li>
          </ol>
          
          <button
            onClick={handleBulkUpload}
            disabled={isUploading}
            className={`px-6 py-3 rounded-lg font-medium ${
              isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Start Bulk Upload'}
          </button>
        </div>

        {log.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg shadow p-6 font-mono text-sm overflow-auto max-h-[600px]">
            {log.map((line, index) => (
              <div key={index} className="mb-1">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

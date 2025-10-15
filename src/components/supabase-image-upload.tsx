"use client";

import { useState, useRef } from "react";
import { getSupabaseClient, STORAGE_BUCKET, isSupabaseConfigured } from "@/lib/supabase";

interface SupabaseImageUploadProps {
  onUploadComplete: (url: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  label?: string;
  required?: boolean;
}

export default function SupabaseImageUpload({
  onUploadComplete,
  onImageRemove,
  currentImage,
  label = "Upload Image",
  required = false
}: SupabaseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL immediately for better UX
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Simulate upload for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
        
        // For demo, we'll use the local blob URL
        // In real implementation, this would be the Supabase public URL
        const mockUrl = `https://demo-storage.supabase.co/storage/v1/object/public/travel-images/locations/${Date.now()}-${file.name}`;
        onUploadComplete(mockUrl);
        
        alert('Demo mode: Ảnh đã được "upload" thành công! (Chưa kết nối Supabase thật)');
        return;
      }

      // Generate unique filename for real upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `locations/${fileName}`;

      // Get Supabase client
      const supabase = getSupabaseClient();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Clean up local preview URL
      URL.revokeObjectURL(localPreviewUrl);
      
      // Set the actual uploaded URL
      setPreviewUrl(urlData.publicUrl);
      onUploadComplete(urlData.publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Lỗi upload ảnh. Vui lòng thử lại.');
      
      // Clean up preview on error
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    uploadImage(file);
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onImageRemove();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white text-sm">Đang upload...</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
          ) : (
            <div className="text-4xl text-gray-400 mx-auto mb-2">📷</div>
          )}
          
          <p className="text-sm text-gray-600 mb-1">
            {isUploading ? 'Đang upload...' : 'Kéo thả ảnh vào đây hoặc click để chọn'}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}

      {isUploading && (
        <p className="text-xs text-blue-600">
          💡 Ảnh đang được upload lên Supabase Storage...
        </p>
      )}

      {!isSupabaseConfigured() && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          🧪 <strong>Demo Mode:</strong> Supabase chưa được cấu hình. Upload sẽ được mô phỏng.
        </div>
      )}
    </div>
  );
}
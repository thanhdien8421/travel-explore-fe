"use client";

import { useState, useRef } from "react";
import { MdPhotoCamera } from "react-icons/md";
import { getSupabaseClient, STORAGE_BUCKET, isSupabaseConfigured } from "@/lib/supabase";
import { generateSlug } from "@/lib/slug";
import Image from "next/image";

interface SupabaseImageUploadProps {
  onUploadComplete: (url: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  placeName?: string;  // Place name to generate slug-based filename
  label?: string;
  required?: boolean;
}

export default function SupabaseImageUpload({
  onUploadComplete,
  onImageRemove,
  currentImage,
  placeName,
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
        throw new Error('Supabase chưa được cấu hình. Vui lòng kiểm tra environment variables.');
      }

      // Generate filename based on place name if provided, otherwise use random
      const fileExt = file.name.split('.').pop();
      let fileName: string;
      
      console.log("placeName from props:", placeName);
      
      if (placeName && placeName.trim()) {
        // Use slug-based filename: slug.ext (e.g., "dinh-doc-lap.jpg")
        const slug = generateSlug(placeName);
        fileName = `${slug}.${fileExt}`;
        console.log("✅ Using slug-based name:", fileName);
      } else {
        // Fallback to timestamp-based filename if no place name
        fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        console.log("❌ placeName empty, using random:", fileName);
      }

      // Get Supabase client
      const supabaseClient = getSupabaseClient();

      // Get signed upload URL from backend
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error('Vui lòng đăng nhập để upload ảnh');
      }

      console.log("📝 Requesting signed URL for:", fileName);
      console.log("API endpoint:", `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload/signed-url`);
      console.log("Request body:", { fileName });

      const signedUrlResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload/signed-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      console.log("Response status:", signedUrlResponse.status);
      
      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.text();
        console.error("❌ Error response:", errorData);
        throw new Error(`Không thể lấy signed URL: ${signedUrlResponse.status} ${errorData}`);
      }

      const responseData = await signedUrlResponse.json();
      console.log("✅ Signed URL received:", responseData);

      const { signedUrl } = responseData;

      console.log("🚀 Uploading to Supabase via signed URL:", signedUrl);

      // Upload directly to Supabase using signed URL
      // IMPORTANT: Must use PUT method for signed URL uploads, not POST
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Upload error:", uploadResponse.status, errorText);
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
      }

      console.log("✅ File uploaded successfully to Supabase");

      // Clean up local preview URL
      URL.revokeObjectURL(localPreviewUrl);
      
      // Return just the filename (what backend expects), not the full URL
      // Backend will use getImageUrl() to convert this to full Supabase URL
      onUploadComplete(fileName);
      
      // For preview, we can generate the public URL
      const { data: urlData } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);
      setPreviewUrl(urlData.publicUrl);

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
          <Image
            src={previewUrl}
            width={500}
            height={300}
            alt="Preview"
            className="w-full h-92 object-cover rounded-lg border"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg gap-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white border-r-white animate-spin"></div>
              </div>
              <span className="text-white text-sm">Đang upload...</span>
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
            <MdPhotoCamera className="text-4xl text-gray-400 mx-auto mb-2" />
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
        <p className="text-xs text-blue-600 flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Ảnh đang được upload lên Supabase Storage...
        </p>
      )}
    </div>
  );
}
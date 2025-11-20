"use client";

import { useState, useRef, useEffect } from "react";
import { MdPhotoCamera, MdDelete, MdCheckCircle } from "react-icons/md";
import { getImageUrl } from "@/lib/image-utils";

interface UploadedImage {
  file: File;
  preview: string;
  isCover: boolean;
}

interface ExistingImage {
  id: string;
  image_url: string;
  is_cover: boolean;
  caption?: string | null;
}

interface MultiImageUploadProps {
  onImagesChanged: (data: { newImages: UploadedImage[]; deletedImageIds: string[]; existingImages: ExistingImage[] }) => void;
  label?: string;
  maxImages?: number;
  existingImages?: ExistingImage[];
}

export default function MultiImageUpload({
  onImagesChanged,
  label = "Upload Images",
  maxImages = 20,
  existingImages = [],
}: MultiImageUploadProps) {
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [displayedExisting, setDisplayedExisting] = useState<ExistingImage[]>(existingImages);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync displayed existing images when existingImages prop changes
  useEffect(() => {
    setDisplayedExisting(existingImages);
  }, [existingImages]);

  // Notify parent when images change
  useEffect(() => {
    const activeExisting = displayedExisting.filter(img => !deletedImageIds.includes(img.id));
    onImagesChanged({ 
      newImages, 
      deletedImageIds,
      existingImages: activeExisting,
    });
  }, [newImages, deletedImageIds, displayedExisting, onImagesChanged]);

  const handleFilesSelect = (files: File[]) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ chọn file ảnh (JPG, PNG, GIF)');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} quá lớn. Vui lòng chọn file nhỏ hơn 5MB`);
        return false;
      }
      return true;
    });

    const activeExisting = displayedExisting.filter(img => !deletedImageIds.includes(img.id));
    const totalImages = activeExisting.length + newImages.length + validFiles.length;
    
    if (totalImages > maxImages) {
      alert(`Tối đa ${maxImages} ảnh. Hiện tại bạn có ${activeExisting.length + newImages.length} ảnh.`);
      return;
    }

    const newUploadedImages: UploadedImage[] = validFiles.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      isCover: newImages.length === 0 && activeExisting.every(img => !img.is_cover) && idx === 0,
    }));

    setNewImages([...newImages, ...newUploadedImages]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFilesSelect(Array.from(e.dataTransfer.files));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelect(Array.from(e.target.files));
    }
  };

  const removeNewImage = (idx: number) => {
    const updated = newImages.filter((_, i) => i !== idx);
    if (newImages[idx].isCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    setNewImages(updated);
  };

  const removeExistingImage = (imageId: string) => {
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  const setNewImageCover = (idx: number) => {
    const updated = newImages.map((img, i) => ({
      ...img,
      isCover: i === idx,
    }));
    setNewImages(updated);
  };

  const setExistingImageCover = (imageId: string) => {
    const updated = displayedExisting.map(img => ({
      ...img,
      is_cover: img.id === imageId,
    }));
    setDisplayedExisting(updated);
  };

  const activeExisting = displayedExisting.filter(img => !deletedImageIds.includes(img.id));
  const totalCurrent = activeExisting.length + newImages.length;
  const canAddMore = totalCurrent < maxImages;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} 
        {totalCurrent > 0 && <span className="text-gray-500 ml-2">({totalCurrent}/{maxImages})</span>}
      </label>

      {/* Upload Zone */}
      {canAddMore && (
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
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          <MdPhotoCamera className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Kéo thả ảnh vào đây hoặc click để chọn
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}

      {/* Existing Images */}
      {activeExisting.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Ảnh hiện có</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeExisting.map((img) => {
              const fullUrl = getImageUrl(img.image_url);
              return (
              <div key={img.id} className="relative group">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={fullUrl}
                    alt="Existing"
                    className="w-full h-full object-cover"
                  />

                  {img.is_cover && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <MdCheckCircle className="w-4 h-4" />
                        Ảnh bìa
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!img.is_cover && (
                      <button
                        type="button"
                        onClick={() => setExistingImageCover(img.id)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        title="Đặt làm ảnh bìa"
                      >
                        <MdCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="Xóa ảnh"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Ảnh mới</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {newImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-blue-300">
                  <img
                    src={img.preview}
                    alt={`New ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {img.isCover && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <MdCheckCircle className="w-4 h-4" />
                        Ảnh bìa
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => setNewImageCover(idx)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        title="Đặt làm ảnh bìa"
                      >
                        <MdCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="Xóa ảnh"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalCurrent === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <MdPhotoCamera className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chưa có ảnh nào</p>
          <p className="text-sm text-gray-500 mt-1">Kéo thả hoặc click để thêm ảnh</p>
        </div>
      )}
    </div>
  );
}

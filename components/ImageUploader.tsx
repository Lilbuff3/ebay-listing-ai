import React, { useCallback, useState } from 'react';
import { UploadIcon } from '../icons/UploadIcon';
import type { ImageData } from '../types';

interface ImageUploaderProps {
  onImagesUploaded: (files: File[]) => void;
  images: ImageData[];
  onRemoveImage: (index: number) => void;
}

export default function ImageUploader({ onImagesUploaded, images, onRemoveImage }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onImagesUploaded(files);
    }
  }, [onImagesUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onImagesUploaded(files);
    }
  }, [onImagesUploaded]);

  return (
    <div className="mb-8">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50'
        } hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <UploadIcon className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
          Upload Product Images
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Drag and drop your images here, or click to select files
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Supports: JPG, PNG, GIF, WebP
        </p>
      </div>

      {images.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4 text-slate-700 dark:text-slate-300">
            Uploaded Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
                {image.status === 'analyzing' && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
}

const MAX_FILES = 8;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange }) => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    return () => {
      previews.forEach(file => URL.revokeObjectURL(file));
    };
  }, [previews]);

  const processFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const filesArray = Array.from(selectedFiles);
    setUploadError(null);

    previews.forEach(file => URL.revokeObjectURL(file));

    if (filesArray.length > MAX_FILES) {
      setUploadError(`You can only upload a maximum of ${MAX_FILES} images.`);
      setCurrentFiles([]);
      setPreviews([]);
      onImagesChange([]);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        setUploadError(`File "${file.name}" is not a valid image type.`);
        setCurrentFiles([]);
        setPreviews([]);
        onImagesChange([]);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`File "${file.name}" is too large (max ${MAX_SIZE_MB}MB).`);
        setCurrentFiles([]);
        setPreviews([]);
        onImagesChange([]);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setCurrentFiles(validFiles);
    setPreviews(newPreviews);
    onImagesChange(validFiles);
  }, [onImagesChange, previews]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
     if (event.target) {
      event.target.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleRemoveImage = (index: number) => {
    const newFiles = [...currentFiles];
    const newPreviews = [...previews];
    
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setCurrentFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div 
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${dragActive ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 ring-2 ring-violet-500' : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {previews.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Selected Images
              </h3>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                {currentFiles.length} / {MAX_FILES}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={preview} alt={`preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-sm" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 bg-gray-900/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/80 hover:scale-110 backdrop-blur-sm"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <UploadIcon />
            <label htmlFor="file-upload" className="mt-4 text-base font-medium text-slate-700 dark:text-slate-300">
              <span 
                onClick={onButtonClick} 
                className="cursor-pointer font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                Click to upload
              </span>
              {' '}or drag and drop
            </label>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              PNG, JPG, etc. up to {MAX_SIZE_MB}MB each. <span className="font-semibold">Max {MAX_FILES} images.</span>
            </p>
          </div>
        )}
      </div>
      {uploadError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
      )}
    </div>
  );
};
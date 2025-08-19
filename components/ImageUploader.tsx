import React, { useState, useCallback, useEffect } from 'https://esm.sh/react@^19.1.1';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onFilesSelect: (files: File[]) => void;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelect, onClear }) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      imageFiles.forEach(imageFile => URL.revokeObjectURL(imageFile.preview));
    };
  }, [imageFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newImageFiles = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImageFiles(newImageFiles);
      onFilesSelect(files);
    }
  };

  const handleClear = () => {
    imageFiles.forEach(imageFile => URL.revokeObjectURL(imageFile.preview));
    setImageFiles([]);
    onClear();
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
  }, []);
  
  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = Array.from(e.dataTransfer.files) as File[];
      const imageFilesOnly = files.filter(file => file.type.startsWith('image/'));
      if (imageFilesOnly.length > 0) {
        const newImageFiles = imageFilesOnly.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImageFiles(newImageFiles);
        onFilesSelect(imageFilesOnly);
      }
  }, [onFilesSelect]);

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800/50 border-gray-600 hover:border-gray-500 hover:bg-gray-800/80 transition-colors ${isDragging ? 'border-blue-400 bg-gray-700' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
        </div>
        <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      {imageFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Selected Images ({imageFiles.length})</h3>
            <button
                onClick={handleClear}
                className="text-sm font-medium text-red-400 hover:text-red-300"
            >
                Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imageFiles.map((imageFile, index) => (
              <img
                key={index}
                src={imageFile.preview}
                alt={`preview ${index}`}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
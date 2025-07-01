"use client";

import { useDropzone, type DropzoneOptions } from 'react-dropzone';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export default function Dropzone({ onDrop }: DropzoneProps) {
  const dropzoneOptions: DropzoneOptions = {
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop,
    multiple: false,
    noClick: false,
    noKeyboard: false,
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer 
        transition-all duration-200 ease-in-out
        ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-50/50 shadow-md' 
            : 'border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50/30'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-3">
        <svg
          className={`w-10 h-10 ${
            isDragActive ? 'text-indigo-600' : 'text-gray-400'
          } transition-colors duration-200`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <div className="space-y-1">
          <p className={`text-sm font-medium ${
            isDragActive ? 'text-indigo-600' : 'text-gray-600'
          }`}>
            {isDragActive ? (
              'Drop to upload'
            ) : (
              <>
                <span className="text-indigo-600">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
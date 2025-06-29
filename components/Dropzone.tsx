"use client";

import { useCallback } from 'react';
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
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      {/* <input {...getInputProps()} /> */}
      <p className="text-gray-600">
        {isDragActive ? (
          'Drop the image here...'
        ) : (
          'Drag & drop an image here, or click to select'
        )}
      </p>
    </div>
  );
}
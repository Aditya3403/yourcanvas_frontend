"use client";

import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Dropzone from '../components/Dropzone';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type CanvasElement = {
  type: string;
  x: number;
  y: number;
  [key: string]: any;
};

type Canvas = {
  width: number;
  height: number;
  elements: CanvasElement[];
};

export default function CanvasDesigner() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [activeTab, setActiveTab] = useState('shapes');
  const [exporting, setExporting] = useState(false);
  const canvasWidthRef = useRef<HTMLInputElement>(null);
  const canvasHeightRef = useRef<HTMLInputElement>(null);
  const rectangleFormRef = useRef<HTMLFormElement>(null);
  const circleFormRef = useRef<HTMLFormElement>(null);
  const textFormRef = useRef<HTMLFormElement>(null);
  const imageUrlFormRef = useRef<HTMLFormElement>(null);

  // Initialize canvas
  const initCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    const width = parseInt(canvasWidthRef.current?.value || '0');
    const height = parseInt(canvasHeightRef.current?.value || '0');
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      alert('Please enter valid dimensions');
      return;
    }
    
    axios.post(`${BACKEND_URL}/api/canvas/init`, { width, height })
      .then(res => {
        setCanvas(res.data.canvas);
        setElements(res.data.canvas.elements);
        updatePreview();
      })
      .catch(err => {
        console.error('Error initializing canvas:', err);
        alert('Failed to initialize canvas');
      });
  };
  
  // Add rectangle
  const addRectangle = (e: React.FormEvent) => {
    e.preventDefault();
    const form = rectangleFormRef.current;
    if (!form) return;
    
    const data = {
      x: (form.elements.namedItem('x') as HTMLInputElement).value,
      y: (form.elements.namedItem('y') as HTMLInputElement).value,
      width: (form.elements.namedItem('width') as HTMLInputElement).value,
      height: (form.elements.namedItem('height') as HTMLInputElement).value,
      color: (form.elements.namedItem('color') as HTMLInputElement).value
    };
    
    axios.post(`${BACKEND_URL}/api/canvas/add/rectangle`, data)
      .then(res => {
        setElements(res.data.canvas.elements);
        updatePreview();
        form.reset();
      })
      .catch(err => {
        console.error('Error adding rectangle:', err);
        alert('Failed to add rectangle');
      });
  };
  
  // Add circle
  const addCircle = (e: React.FormEvent) => {
    e.preventDefault();
    const form = circleFormRef.current;
    if (!form) return;
    
    const data = {
      x: (form.elements.namedItem('x') as HTMLInputElement).value,
      y: (form.elements.namedItem('y') as HTMLInputElement).value,
      radius: (form.elements.namedItem('radius') as HTMLInputElement).value,
      color: (form.elements.namedItem('color') as HTMLInputElement).value
    };
    
    axios.post(`${BACKEND_URL}/api/canvas/add/circle`, data)
      .then(res => {
        setElements(res.data.canvas.elements);
        updatePreview();
        form.reset();
      })
      .catch(err => {
        console.error('Error adding circle:', err);
        alert('Failed to add circle');
      });
  };
  
  // Add text
  const addText = (e: React.FormEvent) => {
    e.preventDefault();
    const form = textFormRef.current;
    if (!form) return;
    
    const data = {
      x: (form.elements.namedItem('x') as HTMLInputElement).value,
      y: (form.elements.namedItem('y') as HTMLInputElement).value,
      text: (form.elements.namedItem('text') as HTMLInputElement).value,
      font: (form.elements.namedItem('font') as HTMLInputElement).value,
      size: (form.elements.namedItem('size') as HTMLInputElement).value,
      color: (form.elements.namedItem('color') as HTMLInputElement).value
    };
    
    axios.post(`${BACKEND_URL}/api/canvas/add/text`, data)
      .then(res => {
        setElements(res.data.canvas.elements);
        updatePreview();
        form.reset();
      })
      .catch(err => {
        console.error('Error adding text:', err);
        alert('Failed to add text');
      });
  };
  
 const addImageUrl = (e: React.FormEvent) => {
  e.preventDefault();
  const form = imageUrlFormRef.current;
  if (!form) return;
  
  const urlInput = form.elements.namedItem('url') as HTMLInputElement;
  const url = urlInput.value.trim();
  
  if (!url) {
    alert('Please enter an image URL');
    return;
  }
  
  try {
    new URL(url);
  } catch (err) {
    alert('Please enter a valid URL');
    return;
  }
  
  const data = {
    x: (form.elements.namedItem('x') as HTMLInputElement).value,
    y: (form.elements.namedItem('y') as HTMLInputElement).value,
    width: (form.elements.namedItem('width') as HTMLInputElement).value,
    height: (form.elements.namedItem('height') as HTMLInputElement).value,
    url: url
  };
  
  setExporting(true); 
  
  axios.post(`${BACKEND_URL}/api/canvas/add/image-url`, data)
    .then(res => {
      setElements(res.data.canvas.elements);
      setPreviewUrl(`${BACKEND_URL}/api/canvas/preview?t=${Date.now()}`);
      form.reset();
    })
    .catch(err => {
      console.error('Error adding image:', err);
      const errorMsg = err.response?.data?.error || 'Failed to add image from URL';
      alert(errorMsg + (err.response?.data?.details ? `\n\nDetails: ${err.response.data.details}` : ''));
    })
    .finally(() => {
      setExporting(false);
    });
};
  
  const handleImageDrop = useCallback(async (acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  if (!file) return;

  const form = imageUrlFormRef.current;
  if (!form) return;

  const x = (form.elements.namedItem('x') as HTMLInputElement).value;
  const y = (form.elements.namedItem('y') as HTMLInputElement).value;
  const width = (form.elements.namedItem('width') as HTMLInputElement).value;
  const height = (form.elements.namedItem('height') as HTMLInputElement).value;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('x', x);
  formData.append('y', y);
  formData.append('width', width);
  formData.append('height', height);
  
  try {
    setExporting(true);
    
    const res = await axios.post(`${BACKEND_URL}/api/canvas/add/image-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    setElements(res.data.canvas.elements);
    setPreviewUrl(`${BACKEND_URL}/api/canvas/preview?t=${Date.now()}`);
    setTimeout(() => {
      setPreviewUrl(`${BACKEND_URL}/api/canvas/preview?t=${Date.now() + 1}`);
    }, 500);
  } catch (err) {
    console.error('Error uploading image:', err);
    alert('Failed to upload image');
  } finally {
    setExporting(false);
  }
}, []);

  const updatePreview = useCallback(() => {
    if (!canvas) return;
    setPreviewUrl(`${BACKEND_URL}/api/canvas/preview?t=${Date.now()}`);
  }, [canvas]);

  const exportPdf = () => {
    if (!canvas) {
      alert('Please initialize canvas first');
      return;
    }
    
    setExporting(true);
    window.open(`${BACKEND_URL}/api/canvas/export`, '_blank');
    setExporting(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center animate-fade-in">Your Canvas</h1>
        </div>
      </header>
      
      <div className="container mx-auto flex flex-col lg:flex-row p-6 gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3V5M12 3V5M15 3V5M9 12H5M9 12V16M9 12H15M9 12V8M15 12H19M15 12V16M15 12V8M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" />
              </svg>
              Initialize Canvas
            </h2>
            <form onSubmit={initCanvas} className="space-y-4">
              <div className="flex items-center">
                <label className="w-24 font-medium text-gray-700">Width:</label>
                <input 
                  type="number" 
                  ref={canvasWidthRef} 
                  defaultValue="800" 
                  min="1" 
                  required 
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex items-center">
                <label className="w-24 font-medium text-gray-700">Height:</label>
                <input 
                  type="number" 
                  ref={canvasHeightRef} 
                  defaultValue="600" 
                  min="1" 
                  required 
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4M6 12H4M18 12H20M12 18V20M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" />
                </svg>
                Initialize Canvas
              </button>
            </form>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`flex-1 py-3 font-medium text-sm uppercase tracking-wider flex items-center justify-center ${activeTab === 'shapes' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('shapes')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Shapes
            </button>
            <button 
              className={`flex-1 py-3 font-medium text-sm uppercase tracking-wider flex items-center justify-center ${activeTab === 'text' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('text')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Text
            </button>
            <button 
              className={`flex-1 py-3 font-medium text-sm uppercase tracking-wider flex items-center justify-center ${activeTab === 'images' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('images')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Images
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === 'shapes' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    Add Rectangle
                  </h3>
                  <form ref={rectangleFormRef} onSubmit={addRectangle} className="space-y-3">
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">X:</label>
                      <input 
                        type="number" 
                        name="x" 
                        defaultValue="10" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Y:</label>
                      <input 
                        type="number" 
                        name="y" 
                        defaultValue="10" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Width:</label>
                      <input 
                        type="number" 
                        name="width" 
                        defaultValue="100" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Height:</label>
                      <input 
                        type="number" 
                        name="height" 
                        defaultValue="80" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Color:</label>
                      <div className="flex items-center w-full">
                        <input 
                          type="color" 
                          name="color" 
                          defaultValue="#000000" 
                          className="h-10 w-12 cursor-pointer"
                        />
                        <span className="ml-2 text-gray-600">Click to choose</span>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Rectangle
                    </button>
                  </form>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" />
                    </svg>
                    Add Circle
                  </h3>
                  <form ref={circleFormRef} onSubmit={addCircle} className="space-y-3">
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">X:</label>
                      <input 
                        type="number" 
                        name="x" 
                        defaultValue="50" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Y:</label>
                      <input 
                        type="number" 
                        name="y" 
                        defaultValue="50" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Radius:</label>
                      <input 
                        type="number" 
                        name="radius" 
                        defaultValue="40" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Color:</label>
                      <div className="flex items-center w-full">
                        <input 
                          type="color" 
                          name="color" 
                          defaultValue="#ff0000" 
                          className="h-10 w-12 cursor-pointer"
                        />
                        <span className="ml-2 text-gray-600">Click to choose</span>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Circle
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {activeTab === 'text' && (
              <div className="animate-fade-in">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Add Text
                  </h3>
                  <form ref={textFormRef} onSubmit={addText} className="space-y-3">
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">X:</label>
                      <input 
                        type="number" 
                        name="x" 
                        defaultValue="20" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Y:</label>
                      <input 
                        type="number" 
                        name="y" 
                        defaultValue="30" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Text:</label>
                      <input 
                        type="text" 
                        name="text" 
                        defaultValue="Hello World" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Font:</label>
                      <select 
                        name="font" 
                        defaultValue="Arial"
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Size:</label>
                      <input 
                        type="number" 
                        name="size" 
                        defaultValue="24" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Color:</label>
                      <div className="flex items-center w-full">
                        <input 
                          type="color" 
                          name="color" 
                          defaultValue="#000000" 
                          className="h-10 w-12 cursor-pointer"
                        />
                        <span className="ml-2 text-gray-600">Click to choose</span>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Text
                    </button>
                  </form>
                </div>
              </div>
            )}
            
            {activeTab === 'images' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add Image from URL
                  </h3>
                  <form ref={imageUrlFormRef} onSubmit={addImageUrl} className="space-y-3">
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">X:</label>
                      <input 
                        type="number" 
                        name="x" 
                        defaultValue="0" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Y:</label>
                      <input 
                        type="number" 
                        name="y" 
                        defaultValue="0" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Width:</label>
                      <input 
                        type="number" 
                        name="width" 
                        defaultValue="200" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Height:</label>
                      <input 
                        type="number" 
                        name="height" 
                        defaultValue="150" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 text-gray-700">Image URL:</label>
                      <input 
                        type="url" 
                        name="url" 
                        defaultValue="https://via.placeholder.com/200" 
                        required 
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Image
                    </button>
                  </form>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Image
                  </h3>
                  <Dropzone onDrop={handleImageDrop} />
                  <p className="text-sm text-gray-500 mt-2">Image will be added at (0,0) with size 100x100</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <button 
              onClick={exportPdf} 
              disabled={!canvas || exporting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                !canvas || exporting 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              {exporting ? 'Exporting...' : 'Export as PDF'}
            </button>
          </div>
        </div>
        
        {/* Preview Area */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Canvas Preview
            </h2>
            {canvas && (
              <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {canvas.width} × {canvas.height} px
              </div>
            )}
          </div>
          
          {canvas ? (
            <div className="animate-fade-in">
              <div className="border-2 border-dashed border-gray-200 bg-white rounded-lg overflow-auto flex items-center justify-center min-h-[300px]">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Canvas Preview" 
                    className="max-w-full h-auto shadow-sm"
                  />
                ) : (
                  <div className="text-gray-400 p-8 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Add elements to see preview</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Elements ({elements.length})
                </h3>
                {elements.length > 0 ? (
                  <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto shadow-inner">
                    {elements.map((el, index) => (
                      <li key={index} className="p-3 hover:bg-gray-50 transition-colors duration-150 flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                          el.type === 'rectangle' ? 'bg-blue-100 text-blue-800' :
                          el.type === 'circle' ? 'bg-purple-100 text-purple-800' :
                          el.type === 'text' ? 'bg-green-100 text-green-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {el.type.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="capitalize font-medium">{el.type}</span>
                          <span className="text-gray-500 text-sm ml-2">at ({el.x}, {el.y})</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500 bg-gray-50">
                    No elements added yet
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3V5M12 3V5M15 3V5M9 12H5M9 12V16M9 12H15M9 12V8M15 12H19M15 12V16M15 12V8M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Canvas Not Initialized</h3>
              <p className="text-gray-500">Please set dimensions and initialize the canvas to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
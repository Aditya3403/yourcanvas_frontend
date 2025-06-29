"use client";

import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Dropzone from '../components/Dropzone';

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
    
    axios.post('http://localhost:5000/api/canvas/init', { width, height })
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
    
    axios.post('http://localhost:5000/api/canvas/add/rectangle', data)
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
    
    axios.post('http://localhost:5000/api/canvas/add/circle', data)
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
    
    axios.post('http://localhost:5000/api/canvas/add/text', data)
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
  
  // Add image from URL
  const addImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const form = imageUrlFormRef.current;
    if (!form) return;
    
    const data = {
      x: (form.elements.namedItem('x') as HTMLInputElement).value,
      y: (form.elements.namedItem('y') as HTMLInputElement).value,
      width: (form.elements.namedItem('width') as HTMLInputElement).value,
      height: (form.elements.namedItem('height') as HTMLInputElement).value,
      url: (form.elements.namedItem('url') as HTMLInputElement).value
    };
    
    axios.post('http://localhost:5000/api/canvas/add/image-url', data)
      .then(res => {
        setElements(res.data.canvas.elements);
        updatePreview();
        form.reset();
      })
      .catch(err => {
        console.error('Error adding image:', err);
        alert('Failed to add image');
      });
  };
  
  // Handle image upload via Dropzone
  const handleImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('x', '0');
    formData.append('y', '0');
    formData.append('width', '100');
    formData.append('height', '100');
    
    axios.post('http://localhost:5000/api/canvas/add/image-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setElements(res.data.canvas.elements);
      updatePreview();
    })
    .catch(err => {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    });
  }, []);

  // Update preview
  const updatePreview = useCallback(() => {
    if (!canvas) return;
    setPreviewUrl(`http://localhost:5000/api/canvas/preview?t=${Date.now()}`);
  }, [canvas]);

  // Export as PDF
  const exportPdf = () => {
    if (!canvas) {
      alert('Please initialize canvas first');
      return;
    }
    
    setExporting(true);
    window.open('http://localhost:5000/api/canvas/export', '_blank');
    setExporting(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold text-center">Canvas Designer</h1>
      </header>
      
      <div className="container mx-auto flex flex-col md:flex-row p-4 gap-4">
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Initialize Canvas</h2>
            <form onSubmit={initCanvas} className="space-y-2">
              <div className="flex items-center">
                <label className="w-20">Width:</label>
                <input 
                  type="number" 
                  ref={canvasWidthRef} 
                  defaultValue="800" 
                  min="1" 
                  required 
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="flex items-center">
                <label className="w-20">Height:</label>
                <input 
                  type="number" 
                  ref={canvasHeightRef} 
                  defaultValue="600" 
                  min="1" 
                  required 
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Initialize
              </button>
            </form>
          </div>
          
          <div className="flex border-b mb-4">
            <button 
              className={`flex-1 py-2 font-medium ${activeTab === 'shapes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('shapes')}
            >
              Shapes
            </button>
            <button 
              className={`flex-1 py-2 font-medium ${activeTab === 'text' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('text')}
            >
              Text
            </button>
            <button 
              className={`flex-1 py-2 font-medium ${activeTab === 'images' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('images')}
            >
              Images
            </button>
          </div>
          
          {activeTab === 'shapes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Add Rectangle</h3>
                <form ref={rectangleFormRef} onSubmit={addRectangle} className="space-y-2">
                  <div className="flex items-center">
                    <label className="w-20">X:</label>
                    <input 
                      type="number" 
                      name="x" 
                      defaultValue="10" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Y:</label>
                    <input 
                      type="number" 
                      name="y" 
                      defaultValue="10" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Width:</label>
                    <input 
                      type="number" 
                      name="width" 
                      defaultValue="100" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Height:</label>
                    <input 
                      type="number" 
                      name="height" 
                      defaultValue="80" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Color:</label>
                    <input 
                      type="color" 
                      name="color" 
                      defaultValue="#000000" 
                      className="h-10 w-full"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                  >
                    Add Rectangle
                  </button>
                </form>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Add Circle</h3>
                <form ref={circleFormRef} onSubmit={addCircle} className="space-y-2">
                  <div className="flex items-center">
                    <label className="w-20">X:</label>
                    <input 
                      type="number" 
                      name="x" 
                      defaultValue="50" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Y:</label>
                    <input 
                      type="number" 
                      name="y" 
                      defaultValue="50" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Radius:</label>
                    <input 
                      type="number" 
                      name="radius" 
                      defaultValue="40" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Color:</label>
                    <input 
                      type="color" 
                      name="color" 
                      defaultValue="#ff0000" 
                      className="h-10 w-full"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                  >
                    Add Circle
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === 'text' && (
            <div>
              <h3 className="text-lg font-medium mb-2">Add Text</h3>
              <form ref={textFormRef} onSubmit={addText} className="space-y-2">
                <div className="flex items-center">
                  <label className="w-20">X:</label>
                  <input 
                    type="number" 
                    name="x" 
                    defaultValue="20" 
                    required 
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-20">Y:</label>
                  <input 
                    type="number" 
                    name="y" 
                    defaultValue="30" 
                    required 
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-20">Text:</label>
                  <input 
                    type="text" 
                    name="text" 
                    defaultValue="Hello World" 
                    required 
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-20">Font:</label>
                  <select 
                    name="font" 
                    defaultValue="Arial"
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="w-20">Size:</label>
                  <input 
                    type="number" 
                    name="size" 
                    defaultValue="24" 
                    required 
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <div className="flex items-center">
                  <label className="w-20">Color:</label>
                  <input 
                    type="color" 
                    name="color" 
                    defaultValue="#000000" 
                    className="h-10 w-full"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                >
                  Add Text
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Add Image from URL</h3>
                <form ref={imageUrlFormRef} onSubmit={addImageUrl} className="space-y-2">
                  <div className="flex items-center">
                    <label className="w-20">X:</label>
                    <input 
                      type="number" 
                      name="x" 
                      defaultValue="0" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Y:</label>
                    <input 
                      type="number" 
                      name="y" 
                      defaultValue="0" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Width:</label>
                    <input 
                      type="number" 
                      name="width" 
                      defaultValue="200" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Height:</label>
                    <input 
                      type="number" 
                      name="height" 
                      defaultValue="150" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="w-20">Image URL:</label>
                    <input 
                      type="url" 
                      name="url" 
                      defaultValue="https://via.placeholder.com/200" 
                      required 
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
                  >
                    Add Image
                  </button>
                </form>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Upload Image</h3>
                <Dropzone onDrop={handleImageDrop} />
                <p className="text-sm text-gray-500 mt-2">Image will be added at (0,0) with size 100x100</p>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Export</h3>
            <button 
              onClick={exportPdf} 
              disabled={!canvas || exporting}
              className={`w-full px-4 py-2 rounded ${!canvas || exporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              {exporting ? 'Exporting...' : 'Export as PDF'}
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Canvas Preview</h2>
          {canvas ? (
            <div>
              <div className="border border-gray-300 bg-white overflow-auto">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Canvas Preview" 
                    className="max-w-full h-auto"
                  />
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">Elements ({elements.length})</h3>
                <ul className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                  {elements.map((el, index) => (
                    <li key={index} className="p-2">
                      <span className="capitalize">{el.type}</span> at ({el.x}, {el.y})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Please initialize the canvas first</p>
          )}
        </div>
      </div>
    </div>
  );
}
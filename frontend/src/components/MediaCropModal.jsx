import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCrop, FiScissors, FiRotateCw, FiMove } from 'react-icons/fi';

const MediaCropModal = ({ isOpen, onClose, files, onProcessedFiles }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [cropSettings, setCropSettings] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [videoSettings, setVideoSettings] = useState({
    maxDuration: 30,
    quality: 'medium'
  });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const currentFile = files[currentFileIndex];
  const isVideo = currentFile?.type.startsWith('video/');
  const isImage = currentFile?.type.startsWith('image/');

  useEffect(() => {
    if (isImage && imageRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setCropSettings(prev => ({
          ...prev,
          x: Math.min(prev.x, containerRect.width - prev.width),
          y: Math.min(prev.y, containerRect.height - prev.height)
        }));
      }
    }
  }, [currentFile, isImage]);

  const handleMouseDown = (e) => {
    if (!isImage) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropSettings.x,
      y: e.clientY - rect.top - cropSettings.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isImage) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(rect.width - cropSettings.width, e.clientX - rect.left - dragStart.x));
    const newY = Math.max(0, Math.min(rect.height - cropSettings.height, e.clientY - rect.top - dragStart.y));
    
    setCropSettings(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const createCroppedImage = async () => {
    if (!isImage || !imageRef.current) return currentFile;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = cropSettings.width;
    canvas.height = cropSettings.height;

    const displayRect = img.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const scaleX = img.naturalWidth / displayRect.width;
    const scaleY = img.naturalHeight / displayRect.height;
    
    const sourceX = cropSettings.x * scaleX;
    const sourceY = cropSettings.y * scaleY;
    const sourceWidth = cropSettings.width * scaleX;
    const sourceHeight = cropSettings.height * scaleY;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((cropSettings.rotation * Math.PI) / 180);
    ctx.scale(cropSettings.scale, cropSettings.scale);

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
    );
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], currentFile.name, { type: currentFile.type });
        resolve(file);
      }, currentFile.type, 0.9);
    });
  };

  const handleProcessCurrent = async () => {
    try {
      let processedFile;
      
      if (isImage) {
        processedFile = await createCroppedImage();
      } else {
        processedFile = currentFile;
      }

      const newProcessedFiles = [...processedFiles];
      newProcessedFiles[currentFileIndex] = processedFile;
      setProcessedFiles(newProcessedFiles);

      if (currentFileIndex < files.length - 1) {
        setCurrentFileIndex(currentFileIndex + 1);
        resetCropSettings();
      } else {
        onProcessedFiles(newProcessedFiles);
        onClose();
      }
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const handleSkipCurrent = () => {
    const newProcessedFiles = [...processedFiles];
    newProcessedFiles[currentFileIndex] = currentFile;
    setProcessedFiles(newProcessedFiles);

    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      resetCropSettings();
    } else {
      onProcessedFiles(newProcessedFiles);
      onClose();
    }
  };

  const resetCropSettings = () => {
    setCropSettings({
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      scale: 1,
      rotation: 0
    });
  };

  if (!isOpen || !files.length) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <FiCrop className="w-5 h-5 text-[#7b5fc4]" />
            <div>
              <h3 className="text-lg font-semibold">
                {isImage ? 'Crop Image' : isVideo ? 'Edit Video' : 'Process File'}
              </h3>
              <p className="text-sm text-gray-600">
                File {currentFileIndex + 1} of {files.length}: {currentFile?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isImage && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg overflow-hidden relative" style={{ height: '400px' }}>
                <div
                  ref={containerRef}
                  className="relative w-full h-full cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    ref={imageRef}
                    src={URL.createObjectURL(currentFile)}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${cropSettings.scale}) rotate(${cropSettings.rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                    draggable={false}
                  />
                  
                  <div
                    className="absolute border-2 border-dashed border-white cursor-move"
                    style={{
                      left: cropSettings.x,
                      top: cropSettings.y,
                      width: cropSettings.width,
                      height: cropSettings.height,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#7b5fc4] rounded-sm cursor-nw-resize"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#7b5fc4] rounded-sm cursor-ne-resize"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#7b5fc4] rounded-sm cursor-sw-resize"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#7b5fc4] rounded-sm cursor-se-resize"></div>
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-[#7b5fc4] rounded-full p-1 shadow-lg">
                      <FiMove className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#f7f4ff] border border-[#dcd6f7] rounded-lg p-3">
                <p className="text-sm text-[#444444]">
                  <strong>How to crop:</strong> Drag the transparent selection area to position it. The selected area will be kept, everything else will be darkened.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    value={cropSettings.width}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{cropSettings.width}px</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={cropSettings.height}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{cropSettings.height}px</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scale</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={cropSettings.scale}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{cropSettings.scale}x</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rotation</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={cropSettings.rotation}
                      onChange={(e) => setCropSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setCropSettings(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FiRotateCw className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{cropSettings.rotation}°</span>
                </div>
              </div>
            </div>
          )}

          {isVideo && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <video
                  src={URL.createObjectURL(currentFile)}
                  controls
                  className="w-full max-h-64 rounded"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Duration (seconds)</label>
                  <input
                    type="number"
                    value={videoSettings.maxDuration}
                    onChange={(e) => setVideoSettings(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-md"
                    min="1"
                    max="60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quality</label>
                  <select
                    value={videoSettings.quality}
                    onChange={(e) => setVideoSettings(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low (480p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="high">High (1080p)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {!isImage && !isVideo && (
            <div className="text-center py-8">
              <p className="text-gray-600">File type not supported for editing</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            {processedFiles.length} of {files.length} files processed
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSkipCurrent}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleProcessCurrent}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-[#7b5fc4] text-white rounded-md hover:bg-[#6b4fb4]"
            >
              {isImage ? <FiCrop className="mr-2" /> : <FiScissors className="mr-2" />}
              {currentFileIndex === files.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCropModal;
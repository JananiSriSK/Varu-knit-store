import React, { useState } from 'react';
import { FiUpload, FiLink, FiX } from 'react-icons/fi';
import { compressImage } from '../utils/imageCompression';

const SimpleMediaUpload = ({ onMediaChange, existingMedia = [] }) => {
  const [uploadMethod, setUploadMethod] = useState('upload');
  const [driveLinks, setDriveLinks] = useState(['']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentExistingMedia, setCurrentExistingMedia] = useState(existingMedia);

  React.useEffect(() => {
    setCurrentExistingMedia(existingMedia);
  }, [existingMedia]);

  const handleMethodChange = (method) => {
    setUploadMethod(method);
    setDriveLinks(['']);
    setSelectedFiles([]);
    onMediaChange({ uploadMethod: method, files: [], driveLinks: [], existingMedia: currentExistingMedia });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const processedFiles = [];
    
    for (const file of files) {
      if (file.type.startsWith('image/') && file.size > maxSize) {
        try {
          const compressed = await compressImage(file);
          if (compressed.size > maxSize) {
            alert(`${file.name} is still too large after compression`);
            continue;
          }
          processedFiles.push(compressed);
        } catch (error) {
          alert(`Failed to compress ${file.name}`);
        }
      } else if (file.size > maxSize) {
        alert(`${file.name} is too large (max 10MB)`);
      } else {
        processedFiles.push(file);
      }
    }
    
    if (processedFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...processedFiles]);
      onMediaChange({ uploadMethod, files: [...selectedFiles, ...processedFiles], driveLinks: [], existingMedia: currentExistingMedia });
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onMediaChange({ uploadMethod, files: newFiles, driveLinks: [], existingMedia: currentExistingMedia });
  };

  const handleDriveLinkChange = (index, value) => {
    const newLinks = [...driveLinks];
    newLinks[index] = value;
    setDriveLinks(newLinks);
    
    const validLinks = newLinks.filter(link => link.trim());
    onMediaChange({ uploadMethod, files: [], driveLinks: validLinks, existingMedia: currentExistingMedia });
  };

  const addDriveLink = () => {
    setDriveLinks([...driveLinks, '']);
  };

  const removeDriveLink = (index) => {
    const newLinks = driveLinks.filter((_, i) => i !== index);
    setDriveLinks(newLinks);
    
    const validLinks = newLinks.filter(link => link.trim());
    onMediaChange({ uploadMethod, files: [], driveLinks: validLinks, existingMedia: currentExistingMedia });
  };

  return (
    <div className="space-y-4">
      {/* Upload Method Selection */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          type="button"
          onClick={() => handleMethodChange('upload')}
          className={`flex items-center justify-center px-4 py-2 rounded-lg border transition ${
            uploadMethod === 'upload'
              ? 'bg-[#f7f4ff] border-[#7b5fc4] text-[#7b5fc4]'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiUpload className="mr-2" />
          Upload Files
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('drive')}
          className={`flex items-center justify-center px-4 py-2 rounded-lg border transition ${
            uploadMethod === 'drive'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FiLink className="mr-2" />
          Google Drive Links
        </button>
      </div>

      {/* File Upload Method */}
      {uploadMethod === 'upload' && (
        <div className="bg-[#f7f4ff] border border-[#dcd6f7] rounded-lg p-4">
          <h4 className="font-medium text-[#444444] mb-2">Upload from Computer</h4>
          <p className="text-sm text-gray-600 mb-3">
            Select images and videos from your computer
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center justify-center flex-1 px-4 py-2 bg-[#7b5fc4] text-white rounded-lg cursor-pointer hover:bg-[#6b4fb4] transition"
              >
                <FiUpload className="mr-2" />
                Add Files
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  setCurrentExistingMedia([]);
                  onMediaChange({ uploadMethod, files: [], driveLinks: [], existingMedia: [] });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({selectedFiles.length}):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-20 object-contain bg-white rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                    <div className="text-xs text-gray-600 mt-1 truncate">{file.name}</div>
                    <div className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Google Drive Links Method */}
      {uploadMethod === 'drive' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Use Google Drive Links</h4>
          <p className="text-sm text-green-600 mb-3">
            Paste Google Drive share links for images and videos
          </p>
          
          {driveLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleDriveLinkChange(index, e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7b5fc4]"
              />
              {driveLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDriveLink(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addDriveLink}
            className="text-[#7b5fc4] hover:text-[#6b4fb4] text-sm font-medium"
          >
            + Add another link
          </button>
        </div>
      )}

      {/* Existing Media Preview */}
      {currentExistingMedia.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Media:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentExistingMedia.map((media, index) => (
              <div key={index} className="relative group">
                <img
                  src={media.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-16 sm:h-20 object-contain bg-white rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedMedia = currentExistingMedia.filter((_, i) => i !== index);
                    setCurrentExistingMedia(updatedMedia);
                    onMediaChange({ 
                      uploadMethod, 
                      files: selectedFiles, 
                      driveLinks: driveLinks.filter(link => link.trim()), 
                      existingMedia: updatedMedia 
                    });
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="absolute bottom-1 right-1">
                  <span className={`text-xs px-1 py-0.5 rounded text-white ${
                    media.source === 'drive' ? 'bg-green-500' : 'bg-[#7b5fc4]'
                  }`}>
                    {media.source === 'drive' ? 'Drive' : 'Upload'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMediaUpload;
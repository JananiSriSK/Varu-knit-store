import React, { useState } from 'react';
import { FiUpload, FiLink, FiX, FiEdit } from 'react-icons/fi';
import MediaCropModal from './MediaCropModal';

const AdminMediaUpload = ({ onMediaChange, existingMedia = [] }) => {
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'drive'
  const [driveLinks, setDriveLinks] = useState(['']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [currentExistingMedia, setCurrentExistingMedia] = useState(existingMedia);

  const handleMethodChange = (method) => {
    setUploadMethod(method);
    setDriveLinks(['']);
    setSelectedFiles([]);
    onMediaChange({ uploadMethod: method, files: [], driveLinks: [], existingMedia: currentExistingMedia });
  };

  // Update current existing media when prop changes
  React.useEffect(() => {
    setCurrentExistingMedia(existingMedia);
  }, [existingMedia]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]); // Add to existing files
    setProcessedFiles([]);
    // Don't clear the input to allow multiple selections
  };

  const openGoogleDrivePicker = () => {
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessedFiles = (files) => {
    setProcessedFiles(files);
    onMediaChange({ uploadMethod, files, driveLinks: [] });
    setShowCropModal(false);
  };

  const openCropModal = () => {
    if (selectedFiles.length > 0) {
      setShowCropModal(true);
    }
  };

  const handleDriveLinkChange = (index, value) => {
    const newLinks = [...driveLinks];
    newLinks[index] = value;
    setDriveLinks(newLinks);
    
    const validLinks = newLinks.filter(link => link.trim());
    onMediaChange({ uploadMethod, files: [], driveLinks: validLinks });
  };

  const addDriveLink = () => {
    setDriveLinks([...driveLinks, '']);
  };

  const removeDriveLink = (index) => {
    const newLinks = driveLinks.filter((_, i) => i !== index);
    setDriveLinks(newLinks);
    
    const validLinks = newLinks.filter(link => link.trim());
    onMediaChange({ uploadMethod, files: [], driveLinks: validLinks });
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
              ? 'bg-blue-50 border-blue-300 text-blue-700'
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
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Upload from Computer</h4>
            <p className="text-sm text-blue-600 mb-3">
              Select images and videos from your computer to upload to Cloudinary
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
                  className="inline-flex items-center justify-center flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
                >
                  <FiUpload className="mr-2" />
                  Add More Files
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Clear All
                </button>
              </div>
              <p className="text-xs text-gray-500">
                You can select multiple files. Click "Add More Files" to add additional files.
              </p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({selectedFiles.length}):
                </p>
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center bg-gray-50 p-2 rounded">
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400 mx-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={openCropModal}
                  className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <FiEdit className="mr-2" />
                  Crop & Edit Files
                </button>
                {processedFiles.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {processedFiles.length} files processed and ready to upload
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Drive Links Method */}
      {uploadMethod === 'drive' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-green-800">Use Google Drive Links</h4>
              <p className="text-sm text-green-600">
                Paste Google Drive share links for images and videos:
              </p>
            </div>
            <button
              type="button"
              onClick={openGoogleDrivePicker}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
            >
              Open Drive
            </button>
          </div>
          
          {driveLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleDriveLinkChange(index, e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add another link
          </button>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Make sure your Google Drive files are set to "Anyone with the link can view" 
              for them to display properly on your website.
            </p>
          </div>
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
                  className="w-full h-16 sm:h-20 object-cover rounded-md border"
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
                    media.source === 'drive' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {media.source === 'drive' ? 'Drive' : 'Upload'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crop Modal */}
      <MediaCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        files={selectedFiles}
        onProcessedFiles={handleProcessedFiles}
      />
    </div>
  );
};

export default AdminMediaUpload;
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, File, Image, Video, FileText, Download, Search, Settings, Home, Star, Clock, Share } from "lucide-react";

function GoogleDriveClone(props) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Backend API base URL
  const API_BASE_URL = "https://gdclone-c7gy.onrender.com";

  // Fetch files from the backend
  const fetchFiles = useCallback(async () => {
    console.log("Fetching files...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/drive`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched files:", data);
      
      // Transform the data to include additional metadata
      const transformedFiles = data.map(file => ({
        id: file.id,
        url: file.url,
        name: file.url ? file.url.split('/').pop() : 'Unknown file',
        size: 'Unknown size',
        uploadedAt: file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Unknown date'
      }));
      
      setFiles(transformedFiles);
      setError("");
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files. Please check your connection.");
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle opening modal
  const handleOpenModal = () => {
    console.log("Opening upload modal...");
    setIsModalOpen(true);
    setError("");
  };

  // Handle closing modal
  const handleCloseModal = () => {
    console.log("Closing modal...");
    setIsModalOpen(false);
    setSelectedFiles([]);
    setUploadProgress(0);
    setError("");
  };

  // Handle file selection
  const handleFileChange = (event) => {
    console.log("File selection changed");
    console.log("Event target:", event.target);
    console.log("Event target files:", event.target.files);
    
    if (!event.target.files || event.target.files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    const files = Array.from(event.target.files);
    console.log("Selected files:", files);
    console.log("File names:", files.map(f => f.name));
    
    setSelectedFiles(files);
    setError("");
    
    alert(`Selected ${files.length} files: ${files.map(f => f.name).join(', ')}`);
  };

  // Handle multiple file upload
  const handleMultipleFileSubmit = async () => {
    console.log("Upload button clicked, selected files:", selectedFiles);
    
    if (selectedFiles.length === 0) {
      const errorMsg = "Please select at least one file first!";
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    // Create FormData for file upload
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      console.log(`Adding file ${index}:`, file.name);
      formData.append("files", file);
    });

    try {
      console.log("Starting upload to:", `${API_BASE_URL}/api/upload-multiple`);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/upload-multiple`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      // Refresh file list after successful upload
      await fetchFiles();
      
      // Reset form
      handleCloseModal();
      alert("Files uploaded successfully!");
      
    } catch (error) {
      console.error("Error uploading files:", error);
      const errorMsg = `Upload failed: ${error.message}`;
      setError(errorMsg);
      alert(errorMsg);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    if (['mp4', 'webm', 'avi', 'mov'].includes(extension)) {
      return <Video className="w-6 h-6 text-red-500" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="w-6 h-6 text-green-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Check if file is an image
  const isImage = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  };

  // Check if file is a video
  const isVideo = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'avi', 'mov'].includes(extension);
  };

  console.log("Rendering component, isModalOpen:", isModalOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Drive</h2>
          </div>
        </div>

        {/* New Button */}
        <div className="p-4">
          <button 
            onClick={handleOpenModal}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            type="button"
          >
            <Upload className="w-4 h-4" />
            New
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {[
            { icon: Home, label: "Home", active: true },
            { icon: File, label: "My Drive" },
            { icon: Share, label: "Shared with me" },
            { icon: Clock, label: "Recent" },
            { icon: Star, label: "Starred" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                item.active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in Drive"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Drive</h1>
            <p className="text-gray-600">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
            </p>
          </div>

          {/* File Grid */}
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg border p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {getFileIcon(file.name)}
                    </div>
                  </div>
                  
                  {/* File Preview */}
                  {isImage(file.name) && (
                    <div className="mb-3">
                      <img
                        src={file.url}
                        alt="File Preview"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {isVideo(file.name) && (
                    <div className="mb-3">
                      <video
                        src={file.url}
                        className="w-full h-32 object-cover rounded"
                        controls={false}
                        poster=""
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {file.size && formatFileSize(file.size)} • {file.uploadedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No files found' : 'No files yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Upload your first file to get started'
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={handleOpenModal}
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Choose files or drag them here
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                id="file-input-unique"
                ref={(input) => {
                  if (input) {
                    console.log("File input element found:", input);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  console.log("Browse Files button clicked");
                  const fileInput = document.getElementById('file-input-unique');
                  if (fileInput) {
                    console.log("File input found, triggering click");
                    fileInput.click();
                  } else {
                    console.error("File input not found!");
                  }
                }}
                className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected {selectedFiles.length} file(s):
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      {file.name} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleMultipleFileSubmit}
                disabled={isUploading || selectedFiles.length === 0}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </button>
              <button
                onClick={handleCloseModal}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleDriveClone;

import React, { useState } from 'react';

export default function ExcelUploadModal({ type, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
        return;
      }
      
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:5000/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults(result.results);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/upload/template/${type}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_template.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download template');
      }
    } catch (error) {
      setError('Failed to download template');
    }
  };

  const getTypeDisplayName = () => {
    switch (type) {
      case 'courses': return 'Courses';
      case 'subjects': return 'Subjects';
      case 'topics': return 'Topics';
      case 'subtopics': return 'Subtopics';
      default: return type;
    }
  };

  const getTemplateDescription = () => {
    switch (type) {
      case 'courses':
        return 'Upload courses with columns: Course Name/name, Course Code/code, HOD ID/hod_id (flexible naming)';
      case 'subjects':
        return 'Upload subjects with columns: Subject Name, Course Code, Semester';
      case 'topics':
        return 'Upload topics with columns: Topic Name, Subject Name, Course Code';
      case 'subtopics':
        return 'Upload subtopics with columns: Subtopic Name, Topic Name, Subject Name, Course Code, Description, Order';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative flex flex-col justify-center items-center max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-blue-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Upload {getTypeDisplayName()}</h2>
        
        <div className="w-full space-y-6">
          {/* Template Download Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Template</h3>
            <p className="text-sm text-gray-600 mb-3">{getTemplateDescription()}</p>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              📥 Download Template
            </button>
          </div>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {file ? file.name : 'Click to select Excel file'}
              </div>
              <div className="text-sm text-gray-500">
                {file ? 'File selected' : 'or drag and drop here'}
              </div>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h4 className="font-semibold mb-2">Upload Results:</h4>
              <div className="text-sm space-y-1">
                <div>✅ Successfully uploaded: {uploadResults.success}</div>
                <div>⏭️ Skipped (already exists): {uploadResults.skipped}</div>
                {uploadResults.errors.length > 0 && (
                  <div className="mt-3">
                    <div className="font-semibold">❌ Errors:</div>
                    <div className="max-h-32 overflow-y-auto text-xs">
                      {uploadResults.errors.map((error, index) => (
                        <div key={index} className="text-red-600">• {error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
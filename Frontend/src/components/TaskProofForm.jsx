import React, { useState } from 'react';
import { taskAPI, fileAPI } from '../services/api';

const TaskProofForm = ({ taskId, onProofSubmitted }) => {
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!proofText.trim() && !proofFile) {
      setError('Please provide proof text or upload a file');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Upload file if present
      let fileData = null;
      if (proofFile) {
        const fileUploadResult = await fileAPI.storeFile(proofFile);
        if (fileUploadResult.success) {
          fileData = {
            fileId: fileUploadResult.fileId,
            fileName: proofFile.name,
            fileType: proofFile.type,
            fileSize: proofFile.size
          };
        }
      }
      
      // Submit proof
      const result = await taskAPI.submitProof(taskId, {
        proofText,
        fileData
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit proof');
      }
      
      setSubmitSuccess(true);
      setProofText('');
      setProofFile(null);
      
      // Notify parent component
      if (onProofSubmitted) {
        onProofSubmitted();
      }
      
    } catch (error) {
      console.error("Error submitting proof:", error);
      setError(error.message || 'An error occurred while submitting proof');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If already submitted successfully
  if (submitSuccess) {
    return (
      <div className="p-4 bg-green-50 rounded-md">
        <div className="flex">
          <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="ml-3 text-sm text-green-700">
            Your proof has been submitted successfully and is awaiting review.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Submit Task Proof</h4>
      
      {error && (
        <div className="p-3 mb-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="proofText" className="block text-sm font-medium text-gray-700 mb-1">
            Proof Description
          </label>
          <textarea
            id="proofText"
            rows="3"
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            placeholder="Describe how you completed this task..."
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="proofFile" className="block text-sm font-medium text-gray-700 mb-1">
            Proof File (Optional)
          </label>
          <div className="flex items-center">
            <input
              id="proofFile"
              type="file"
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor="proofFile"
              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Choose file
            </label>
            <span className="ml-3 text-sm text-gray-500">
              {proofFile ? proofFile.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isSubmitting ? 'Submitting...' : 'Submit Proof'}
        </button>
      </form>
    </div>
  );
};

export default TaskProofForm;
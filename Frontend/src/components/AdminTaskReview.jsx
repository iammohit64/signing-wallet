import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';

const AdminTaskReview = ({ pendingProofs = [], onReviewed }) => {
  const [expandedProofId, setExpandedProofId] = useState(null);
  const [proofDetails, setProofDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({});
  const [reviewNotes, setReviewNotes] = useState({});

  // Fetch task details for proofs
  useEffect(() => {
    const fetchTaskDetails = async () => {
      const details = {};
      
      for (const proof of pendingProofs) {
        try {
          const task = await taskAPI.getTaskById(proof.taskId);
          if (task) {
            details[proof.id] = { task };
          }
        } catch (error) {
          console.error(`Error fetching task for proof ${proof.id}:`, error);
        }
      }
      
      setProofDetails(details);
    };
    
    if (pendingProofs.length > 0) {
      fetchTaskDetails();
    }
  }, [pendingProofs]);
  
  const handleExpand = (proofId) => {
    setExpandedProofId(expandedProofId === proofId ? null : proofId);
  };
  
  const handleReview = async (proofId, isApproved) => {
    try {
      setIsLoading(true);
      setReviewStatus({
        proofId,
        status: 'loading',
        message: `${isApproved ? 'Approving' : 'Rejecting'} task...`
      });
      
      // Review the proof
      const result = await taskAPI.reviewProof(proofId, isApproved, reviewNotes[proofId] || '');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to review task');
      }
      
      setReviewStatus({
        proofId,
        status: 'success',
        message: `Task ${isApproved ? 'approved' : 'rejected'} successfully!`
      });
      
      // Notify parent component to refresh data
      if (onReviewed) {
        onReviewed();
      }
      
    } catch (error) {
      console.error("Error reviewing proof:", error);
      setReviewStatus({
        proofId,
        status: 'error',
        message: error.message || `Failed to ${isApproved ? 'approve' : 'reject'} task`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotesChange = (proofId, notes) => {
    setReviewNotes(prev => ({ ...prev, [proofId]: notes }));
  };

  if (pendingProofs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
          <p className="mt-1 text-sm text-gray-500">All tasks have been reviewed!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Pending Task Reviews ({pendingProofs.length})</h2>
      
      <div className="space-y-4">
        {pendingProofs.map((proof) => {
          const taskDetails = proofDetails[proof.id]?.task;
          
          return (
            <div 
              key={proof.id} 
              className="border border-gray-200 rounded-md overflow-hidden"
            >
              <div 
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleExpand(proof.id)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {taskDetails ? taskDetails.title : 'Loading task details...'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted {new Date(proof.submittedAt).toLocaleString()}
                  </p>
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedProofId === proof.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {expandedProofId === proof.id && (
                <div className="p-4 border-t border-gray-200">
                  {taskDetails ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Task Details</h4>
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">User</p>
                              <p className="text-sm font-mono">{taskDetails.userAddress.substring(0, 12)}...</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Staked Amount</p>
                              <p className="text-sm">{taskDetails.stakedAmount} ETH</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Deadline</p>
                              <p className="text-sm">{new Date(taskDetails.deadline).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="text-sm">{new Date(taskDetails.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="text-sm mt-1">{taskDetails.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Proof Submission</h4>
                        <div className="bg-gray-50 rounded-md p-3">
                          {proof.proofText && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500">Proof Description</p>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{proof.proofText}</p>
                            </div>
                          )}
                          
                          {proof.fileData && (
                            <div>
                              <p className="text-xs text-gray-500">Attached File</p>
                              <div className="flex items-center mt-1">
                                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-1 text-sm">{proof.fileData.fileName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Review Notes (Optional)</h4>
                        <textarea
                          value={reviewNotes[proof.id] || ''}
                          onChange={(e) => handleNotesChange(proof.id, e.target.value)}
                          placeholder="Add notes about your decision..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          rows="3"
                        ></textarea>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Review Decision</h4>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleReview(proof.id, true)}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(proof.id, false)}
                            disabled={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      
                      {reviewStatus.proofId === proof.id && (
                        <div className={`p-3 rounded-md ${
                          reviewStatus.status === 'error' 
                            ? 'bg-red-50 text-red-700' 
                            : reviewStatus.status === 'success'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {reviewStatus.status === 'loading' && (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>{reviewStatus.message}</span>
                            </div>
                          )}
                          {reviewStatus.status !== 'loading' && (
                            <span>{reviewStatus.message}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-500">Loading task details...</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTaskReview;
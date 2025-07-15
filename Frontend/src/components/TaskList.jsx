import React, { useState } from 'react';
import { taskAPI, fileAPI } from '../services/api';
import { claimStake } from '../utils/web3';
import TaskProofForm from './TaskProofForm';

const TaskList = ({ tasks = [], onTaskUpdated }) => {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState({});
  
  const toggleTaskExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };
  
  const handleClaimStake = async (taskId) => {
    try {
      setIsSubmitting(true);
      setActionStatus({
        taskId,
        status: 'loading',
        message: 'Processing claim...'
      });
      
      // Call blockchain to claim stake
      await claimStake(taskId);
      
      setActionStatus({
        taskId,
        status: 'success',
        message: 'Stake claimed successfully!'
      });
      
      // Refresh data
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error("Error claiming stake:", error);
      setActionStatus({
        taskId,
        status: 'error',
        message: error.message || 'Failed to claim stake'
      });
    } finally {
      setIsSubmitting(false);
      
      // Clear success message after delay
      if (actionStatus.status === 'success') {
        setTimeout(() => {
          setActionStatus({});
        }, 3000);
      }
    }
  };
  
  // Filter tasks by status
  const activeTasks = tasks.filter(task => task.status === 'active');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const failedTasks = tasks.filter(task => task.status === 'failed');
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Failed</span>;
      default:
        return null;
    }
  };
  
  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };
  
  const renderTaskSection = (taskList, title) => {
    if (taskList.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
        <div className="space-y-4">
          {taskList.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                onClick={() => toggleTaskExpand(task.id)}
                className="cursor-pointer p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center">
                    <h3 className="text-md font-medium text-gray-800">{task.title}</h3>
                    <div className="ml-3">{getStatusBadge(task.status)}</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Staked: {task.stakedAmount} ETH • 
                    Due: {formatDate(task.deadline)} • 
                    {task.status === 'active' && (
                      <span className={`ml-1 ${getTimeRemaining(task.deadline) === 'Expired' ? 'text-red-500' : 'text-amber-500'}`}>
                        {getTimeRemaining(task.deadline)} remaining
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedTaskId === task.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedTaskId === task.id && (
                <div className="border-t border-gray-100 p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Description:</h4>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
                  </div>
                  
                  {task.fileData && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Attached File:</h4>
                      <div className="mt-1 flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-500">{task.fileData.fileName}</span>
                      </div>
                    </div>
                  )}
                  
                  {task.status === 'active' && !task.proofSubmitted && (
                    <TaskProofForm taskId={task.id} onProofSubmitted={onTaskUpdated} />
                  )}
                  
                  {task.status === 'active' && task.proofSubmitted && (
                    <div className="p-4 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-700">
                        Proof has been submitted and is waiting for review.
                      </p>
                    </div>
                  )}
                  
                  {task.status === 'completed' && (
                    <div className="flex justify-between items-center">
                      <div className="p-4 bg-green-50 rounded-md flex-1">
                        <p className="text-sm text-green-700">
                          Task completed successfully! You can now claim your stake.
                        </p>
                      </div>
                      <button
                        onClick={() => handleClaimStake(task.id)}
                        disabled={isSubmitting}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                      >
                        {actionStatus.taskId === task.id && actionStatus.status === 'loading' ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        Claim Stake
                      </button>
                    </div>
                  )}
                  
                  {task.status === 'failed' && (
                    <div className="p-4 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">
                        Task was marked as failed. Your stake has been forfeited.
                      </p>
                    </div>
                  )}
                  
                  {actionStatus.taskId === task.id && actionStatus.status === 'error' && (
                    <div className="mt-3 p-4 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">
                        {actionStatus.message}
                      </p>
                    </div>
                  )}
                  
                  {actionStatus.taskId === task.id && actionStatus.status === 'success' && (
                    <div className="mt-3 p-4 bg-green-50 rounded-md">
                      <p className="text-sm text-green-700">
                        {actionStatus.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
        </div>
      ) : (
        <>
          {renderTaskSection(activeTasks, 'Active Tasks')}
          {renderTaskSection(completedTasks, 'Completed Tasks')}
          {renderTaskSection(failedTasks, 'Failed Tasks')}
        </>
      )}
    </div>
  );
};

export default TaskList;
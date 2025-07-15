import React, { useState } from 'react';
import { taskAPI, fileAPI } from '../services/api';
import { createAndStakeTask } from '../utils/web3';

const TaskForm = ({ onTaskCreated, userAddress }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stakedAmount: '',
    deadline: '',
    file: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  
  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files && files[0]) {
      setFormData(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }
    
    if (!formData.stakedAmount || isNaN(parseFloat(formData.stakedAmount)) || parseFloat(formData.stakedAmount) <= 0) {
      newErrors.stakedAmount = 'Please enter a valid stake amount';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Task deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      // Process file upload if exists
      let fileData = null;
      if (formData.file) {
        const fileUploadResult = await fileAPI.storeFile(formData.file);
        if (fileUploadResult.success) {
          fileData = {
            fileId: fileUploadResult.fileId,
            fileName: formData.file.name,
            fileType: formData.file.type,
            fileSize: formData.file.size
          };
        }
      }
      
      // Create task in local backend
      const taskResult = await taskAPI.createTask({
        title: formData.title,
        description: formData.description,
        stakedAmount: parseFloat(formData.stakedAmount),
        deadline: new Date(formData.deadline).toISOString(),
        userAddress,
        fileData
      });
      
      if (!taskResult.success) {
        throw new Error(taskResult.error || 'Failed to create task');
      }
      
      // Interact with blockchain
      await createAndStakeTask(
        taskResult.taskId,
        formData.deadline,
        formData.stakedAmount
      );
      
      // Success!
      setSubmitSuccess('Task created successfully! Your stake has been processed.');
      setFormData({
        title: '',
        description: '',
        stakedAmount: '',
        deadline: '',
        file: null
      });
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated();
      }
      
    } catch (error) {
      console.error("Error creating task:", error);
      setSubmitError(error.message || 'An error occurred while creating the task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Create New Task & Stake</h2>
      
      {submitError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {submitError}
        </div>
      )}
      
      {submitSuccess && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6">
          {submitSuccess}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Task Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="stakedAmount" className="block text-sm font-medium text-gray-700">
            Stake Amount (ETH) *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="stakedAmount"
              name="stakedAmount"
              step="0.001"
              min="0.001"
              value={formData.stakedAmount}
              onChange={handleChange}
              className={`block w-full pr-12 rounded-md ${
                errors.stakedAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">ETH</span>
            </div>
          </div>
          {errors.stakedAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.stakedAmount}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Task Deadline *
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            min={minDate}
            value={formData.deadline}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.deadline ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Upload File (optional)
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleChange}
              className="sr-only"
            />
            <label
              htmlFor="file"
              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Choose file
            </label>
            <span className="ml-3 text-sm text-gray-500">
              {formData.file ? formData.file.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isSubmitting ? 'Processing...' : 'Create Task & Stake'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
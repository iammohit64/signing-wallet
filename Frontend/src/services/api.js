// API service for backend interactions
import { v4 as uuidv4 } from 'uuid';

// Mock backend with localStorage
const LOCAL_STORAGE_KEYS = {
  TASKS: 'zl_tasks',
  PROOFS: 'zl_proofs',
  USER_STATS: 'zl_user_stats'
};

// Helper to get data from localStorage with default
const getLocalData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error retrieving ${key} from localStorage:`, e);
    return defaultValue;
  }
};

// Helper to save data to localStorage
const saveLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    return false;
  }
};

// Task API functions
export const taskAPI = {
  // Create a new task
  createTask: async (taskData) => {
    try {
      const tasks = getLocalData(LOCAL_STORAGE_KEYS.TASKS);
      
      // Generate task ID
      const taskId = uuidv4();
      
      // Create new task with timestamps
      const newTask = {
        id: taskId,
        ...taskData,
        status: 'active', // active, completed, failed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save task
      tasks.push(newTask);
      saveLocalData(LOCAL_STORAGE_KEYS.TASKS, tasks);
      
      // Update user statistics
      statsAPI.trackTaskCreation(taskData.userAddress, taskData.stakedAmount);
      
      return { success: true, taskId, task: newTask };
    } catch (error) {
      console.error("Error creating task:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Get all tasks for a user
  getUserTasks: async (userAddress) => {
    try {
      const tasks = getLocalData(LOCAL_STORAGE_KEYS.TASKS);
      return tasks.filter(task => task.userAddress.toLowerCase() === userAddress.toLowerCase());
    } catch (error) {
      console.error("Error getting user tasks:", error);
      return [];
    }
  },
  
  // Get all tasks (admin only)
  getAllTasks: async () => {
    try {
      return getLocalData(LOCAL_STORAGE_KEYS.TASKS);
    } catch (error) {
      console.error("Error getting all tasks:", error);
      return [];
    }
  },
  
  // Get a task by ID
  getTaskById: async (taskId) => {
    try {
      const tasks = getLocalData(LOCAL_STORAGE_KEYS.TASKS);
      return tasks.find(task => task.id === taskId);
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
  },
  
  // Submit proof for a task
  submitProof: async (taskId, proofData) => {
    try {
      const proofs = getLocalData(LOCAL_STORAGE_KEYS.PROOFS);
      
      // Create proof record
      const newProof = {
        id: uuidv4(),
        taskId,
        ...proofData,
        status: 'pending', // pending, approved, rejected
        submittedAt: new Date().toISOString()
      };
      
      // Save proof
      proofs.push(newProof);
      saveLocalData(LOCAL_STORAGE_KEYS.PROOFS, proofs);
      
      // Update task
      const tasks = getLocalData(LOCAL_STORAGE_KEYS.TASKS);
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex].proofSubmitted = true;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        saveLocalData(LOCAL_STORAGE_KEYS.TASKS, tasks);
      }
      
      return { success: true, proofId: newProof.id };
    } catch (error) {
      console.error("Error submitting proof:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Review proof (admin only)
  reviewProof: async (proofId, isApproved, reviewNotes = '') => {
    try {
      // Update proof status
      const proofs = getLocalData(LOCAL_STORAGE_KEYS.PROOFS);
      const proofIndex = proofs.findIndex(proof => proof.id === proofId);
      
      if (proofIndex === -1) {
        throw new Error("Proof not found");
      }
      
      proofs[proofIndex].status = isApproved ? 'approved' : 'rejected';
      proofs[proofIndex].reviewNotes = reviewNotes;
      proofs[proofIndex].reviewedAt = new Date().toISOString();
      
      saveLocalData(LOCAL_STORAGE_KEYS.PROOFS, proofs);
      
      // Update task status
      const taskId = proofs[proofIndex].taskId;
      const tasks = getLocalData(LOCAL_STORAGE_KEYS.TASKS);
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex].status = isApproved ? 'completed' : 'failed';
        tasks[taskIndex].updatedAt = new Date().toISOString();
        saveLocalData(LOCAL_STORAGE_KEYS.TASKS, tasks);
        
        // Update user statistics
        if (isApproved) {
          statsAPI.trackTaskSuccess(tasks[taskIndex].userAddress, tasks[taskIndex].stakedAmount);
        } else {
          statsAPI.trackTaskFailure(tasks[taskIndex].userAddress, tasks[taskIndex].stakedAmount);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error reviewing proof:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Get proofs for a task
  getProofsForTask: async (taskId) => {
    try {
      const proofs = getLocalData(LOCAL_STORAGE_KEYS.PROOFS);
      return proofs.filter(proof => proof.taskId === taskId);
    } catch (error) {
      console.error("Error getting proofs:", error);
      return [];
    }
  },
  
  // Get all pending proofs (admin only)
  getPendingProofs: async () => {
    try {
      const proofs = getLocalData(LOCAL_STORAGE_KEYS.PROOFS);
      return proofs.filter(proof => proof.status === 'pending');
    } catch (error) {
      console.error("Error getting pending proofs:", error);
      return [];
    }
  }
};

// User stats API functions
export const statsAPI = {
  // Get user statistics
  getUserStats: async (userAddress) => {
    try {
      const stats = getLocalData(LOCAL_STORAGE_KEYS.USER_STATS, {});
      return stats[userAddress.toLowerCase()] || {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        totalStaked: 0,
        totalReturned: 0,
        totalBurned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedAt: null
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  },
  
  // Track task creation
  trackTaskCreation: (userAddress, amount) => {
    try {
      const stats = getLocalData(LOCAL_STORAGE_KEYS.USER_STATS, {});
      const address = userAddress.toLowerCase();
      
      if (!stats[address]) {
        stats[address] = {
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          totalStaked: 0,
          totalReturned: 0,
          totalBurned: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedAt: null
        };
      }
      
      stats[address].totalTasks += 1;
      stats[address].totalStaked += Number(amount);
      
      saveLocalData(LOCAL_STORAGE_KEYS.USER_STATS, stats);
    } catch (error) {
      console.error("Error tracking task creation:", error);
    }
  },
  
  // Track task success
  trackTaskSuccess: (userAddress, amount) => {
    try {
      const stats = getLocalData(LOCAL_STORAGE_KEYS.USER_STATS, {});
      const address = userAddress.toLowerCase();
      
      if (!stats[address]) {
        return;
      }
      
      const now = new Date();
      const lastCompleted = stats[address].lastCompletedAt 
        ? new Date(stats[address].lastCompletedAt)
        : null;
      
      // Check if streak continues
      if (lastCompleted) {
        const daysSinceLastCompletion = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastCompletion <= 1) {
          // Streak continues
          stats[address].currentStreak += 1;
        } else {
          // Streak broken
          stats[address].currentStreak = 1;
        }
      } else {
        stats[address].currentStreak = 1;
      }
      
      // Update longest streak if needed
      if (stats[address].currentStreak > stats[address].longestStreak) {
        stats[address].longestStreak = stats[address].currentStreak;
      }
      
      stats[address].completedTasks += 1;
      stats[address].totalReturned += Number(amount);
      stats[address].lastCompletedAt = now.toISOString();
      
      saveLocalData(LOCAL_STORAGE_KEYS.USER_STATS, stats);
    } catch (error) {
      console.error("Error tracking task success:", error);
    }
  },
  
  // Track task failure
  trackTaskFailure: (userAddress, amount) => {
    try {
      const stats = getLocalData(LOCAL_STORAGE_KEYS.USER_STATS, {});
      const address = userAddress.toLowerCase();
      
      if (!stats[address]) {
        return;
      }
      
      stats[address].failedTasks += 1;
      stats[address].totalBurned += Number(amount);
      stats[address].currentStreak = 0;
      
      saveLocalData(LOCAL_STORAGE_KEYS.USER_STATS, stats);
    } catch (error) {
      console.error("Error tracking task failure:", error);
    }
  },
  
  // Get all user stats (admin only)
  getAllUserStats: async () => {
    try {
      return getLocalData(LOCAL_STORAGE_KEYS.USER_STATS, {});
    } catch (error) {
      console.error("Error getting all user stats:", error);
      return {};
    }
  }
};

// File storage API
export const fileAPI = {
  // Store a file (mock implementation using localStorage)
  storeFile: async (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // In a real app, this would upload to a server
          // Here we just generate a mock URL
          const fileId = uuidv4();
          const fileObj = {
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
            uploadedAt: new Date().toISOString()
          };
          
          // Store file metadata in localStorage (not the actual file in production)
          const files = getLocalData('zl_files', []);
          files.push({
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: fileObj.uploadedAt
          });
          saveLocalData('zl_files', files);
          
          // For demo, store small file data in localStorage
          // In production, this would be stored on a server
          if (file.size < 1000000) { // Store files smaller than ~1MB
            localStorage.setItem(`zl_file_${fileId}`, reader.result);
          }
          
          resolve({
            success: true,
            fileId,
            fileUrl: `/api/files/${fileId}` // Mock URL
          });
        };
        reader.onerror = (error) => reject(error);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // Get file by ID
  getFile: async (fileId) => {
    try {
      const fileData = localStorage.getItem(`zl_file_${fileId}`);
      if (fileData) {
        return { success: true, fileData };
      } else {
        throw new Error("File not found or too large for localStorage");
      }
    } catch (error) {
      console.error("Error retrieving file:", error);
      return { success: false, error: error.message };
    }
  }
};
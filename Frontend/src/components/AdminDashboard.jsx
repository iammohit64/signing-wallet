import React, { useEffect, useState } from 'react';
import { taskAPI, statsAPI } from '../services/api';
import StatsCard from './StatsCard';
import AdminTaskReview from './AdminTaskReview';

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [pendingProofs, setPendingProofs] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all tasks
        const allTasks = await taskAPI.getAllTasks();
        setTasks(allTasks);
        
        // Fetch pending proofs
        const pendingProofsList = await taskAPI.getPendingProofs();
        setPendingProofs(pendingProofsList);
        
        // Fetch all user stats
        const allUserStats = await statsAPI.getAllUserStats();
        setStats(allUserStats);
        
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  // Refresh data after proof review
  const handleProofReviewed = async () => {
    // Fetch pending proofs
    const pendingProofsList = await taskAPI.getPendingProofs();
    setPendingProofs(pendingProofsList);
    
    // Fetch all tasks
    const allTasks = await taskAPI.getAllTasks();
    setTasks(allTasks);
    
    // Fetch all user stats
    const allUserStats = await statsAPI.getAllUserStats();
    setStats(allUserStats);
  };
  
  // Calculate platform stats
  const calculatePlatformStats = () => {
    const totalUsers = Object.keys(stats).length;
    
    let totalTasksCreated = 0;
    let totalTasksCompleted = 0;
    let totalTasksFailed = 0;
    let totalAmountStaked = 0;
    let totalAmountReturned = 0;
    let totalAmountBurned = 0;
    
    Object.values(stats).forEach(userStat => {
      totalTasksCreated += userStat.totalTasks || 0;
      totalTasksCompleted += userStat.completedTasks || 0;
      totalTasksFailed += userStat.failedTasks || 0;
      totalAmountStaked += userStat.totalStaked || 0;
      totalAmountReturned += userStat.totalReturned || 0;
      totalAmountBurned += userStat.totalBurned || 0;
    });
    
    return {
      totalUsers,
      totalTasksCreated,
      totalTasksCompleted,
      totalTasksFailed,
      totalAmountStaked,
      totalAmountReturned,
      totalAmountBurned,
      completionRate: totalTasksCreated > 0 
        ? Math.round((totalTasksCompleted / totalTasksCreated) * 100) 
        : 0
    };
  };
  
  // Platform stats
  const platformStats = calculatePlatformStats();
  
  const statCards = [
    {
      title: 'Total Users',
      value: platformStats.totalUsers.toString(),
      trend: 'neutral',
      icon: {
        path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        bgColor: 'bg-indigo-500'
      }
    },
    {
      title: 'Total Tasks',
      value: platformStats.totalTasksCreated.toString(),
      trend: 'neutral',
      icon: {
        path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        bgColor: 'bg-blue-500'
      }
    },
    {
      title: 'Total Staked',
      value: `${platformStats.totalAmountStaked.toFixed(2)} ETH`,
      trend: 'neutral',
      icon: {
        path: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
        bgColor: 'bg-green-500'
      }
    },
    {
      title: 'Completion Rate',
      value: `${platformStats.completionRate}%`,
      trend: 'neutral',
      icon: {
        path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        bgColor: 'bg-purple-500'
      }
    },
  ];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pending-reviews')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'pending-reviews'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Reviews
            {pendingProofs.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {pendingProofs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all-tasks')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'all-tasks'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Tasks
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Platform Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Task Status Distribution</h3>
                  <div className="mt-2 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Active</span>
                      <span className="text-xs font-medium text-gray-700">
                        {tasks.filter(t => t.status === 'active').length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ 
                          width: `${tasks.length > 0 
                            ? (tasks.filter(t => t.status === 'active').length / tasks.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Completed</span>
                      <span className="text-xs font-medium text-gray-700">
                        {tasks.filter(t => t.status === 'completed').length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ 
                          width: `${tasks.length > 0 
                            ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Failed</span>
                      <span className="text-xs font-medium text-gray-700">
                        {tasks.filter(t => t.status === 'failed').length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ 
                          width: `${tasks.length > 0 
                            ? (tasks.filter(t => t.status === 'failed').length / tasks.length) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ETH Distribution</h3>
                  <div className="mt-2 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Total Staked</span>
                      <span className="text-xs font-medium text-gray-700">
                        {platformStats.totalAmountStaked.toFixed(2)} ETH
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Total Returned</span>
                      <span className="text-xs font-medium text-gray-700">
                        {platformStats.totalAmountReturned.toFixed(2)} ETH
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ 
                          width: `${platformStats.totalAmountStaked > 0 
                            ? (platformStats.totalAmountReturned / platformStats.totalAmountStaked) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Total Burned</span>
                      <span className="text-xs font-medium text-gray-700">
                        {platformStats.totalAmountBurned.toFixed(2)} ETH
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ 
                          width: `${platformStats.totalAmountStaked > 0 
                            ? (platformStats.totalAmountBurned / platformStats.totalAmountStaked) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
                  <div className="mt-2 space-y-3">
                    {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full mr-2 ${
                            task.status === 'completed' 
                              ? 'bg-green-500' 
                              : task.status === 'failed' 
                                ? 'bg-red-500' 
                                : 'bg-indigo-500'
                          }`}
                        ></div>
                        <div className="text-xs truncate">
                          <span className="font-medium">{task.title}</span>
                          <span className="ml-1 text-gray-500">by {task.userAddress.substring(0, 6)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Admin Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setActiveTab('pending-reviews')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  Review Pending Tasks
                  {pendingProofs.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-white text-indigo-800">
                      {pendingProofs.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'pending-reviews' && (
          <AdminTaskReview 
            pendingProofs={pendingProofs} 
            onReviewed={handleProofReviewed} 
          />
        )}
        
        {activeTab === 'all-tasks' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-800 mb-4">All Tasks</h2>
            {tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staked Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {`${task.userAddress.substring(0, 6)}...${task.userAddress.substring(task.userAddress.length - 4)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.stakedAmount} ETH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === 'active' 
                              ? 'bg-indigo-100 text-indigo-800' 
                              : task.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
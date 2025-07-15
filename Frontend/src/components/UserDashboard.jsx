import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, statsAPI } from '../services/api';
import { getBalance } from '../utils/web3';
import StatsCard from './StatsCard';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's ETH balance
        if (user && user.address) {
          const ethBalance = await getBalance(user.address);
          setBalance(ethBalance);
          
          // Fetch user's tasks
          const userTasks = await taskAPI.getUserTasks(user.address);
          setTasks(userTasks);
          
          // Fetch user's stats
          const userStats = await statsAPI.getUserStats(user.address);
          setStats(userStats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Refresh tasks after a new task is created
  const handleTaskCreated = async () => {
    if (user && user.address) {
      const userTasks = await taskAPI.getUserTasks(user.address);
      setTasks(userTasks);
      
      // Refresh stats
      const userStats = await statsAPI.getUserStats(user.address);
      setStats(userStats);
      
      // Refresh balance
      const ethBalance = await getBalance(user.address);
      setBalance(ethBalance);
    }
  };

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

  const statCards = [
    {
      title: 'Current Balance',
      value: balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH',
      trend: 'neutral',
      icon: {
        path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        bgColor: 'bg-indigo-500'
      }
    },
    {
      title: 'Total Staked',
      value: stats ? `${stats.totalStaked} ETH` : '0 ETH',
      trend: 'neutral',
      icon: {
        path: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
        bgColor: 'bg-blue-500'
      }
    },
    {
      title: 'Current Streak',
      value: stats ? `${stats.currentStreak} days` : '0 days',
      change: stats && stats.currentStreak > 0 ? '+1' : '0',
      trend: stats && stats.currentStreak > 0 ? 'up' : 'neutral',
      icon: {
        path: 'M13 10V3L4 14h7v7l9-11h-7z',
        bgColor: 'bg-yellow-500'
      }
    },
    {
      title: 'Success Rate',
      value: stats ? 
        `${stats.totalTasks > 0 
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
          : 0}%` 
        : '0%',
      trend: 'neutral',
      icon: {
        path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        bgColor: 'bg-green-500'
      }
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">ZeroLag Dashboard</h1>
      
      {/* Welcome message with wallet */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-2">
          Welcome{user.name ? `, ${user.name}` : ''}
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">Wallet:</span>
          <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{`${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}`}</span>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {user.network}
          </span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
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
            onClick={() => setActiveTab('new-task')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'new-task'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create New Task
          </button>
          <button
            onClick={() => setActiveTab('my-tasks')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'my-tasks'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Tasks
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Task Completion</h3>
                  <div className="flex space-x-4 items-center">
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ 
                            width: `${stats && stats.totalTasks > 0 
                              ? (stats.completedTasks / stats.totalTasks) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats ? `${stats.completedTasks}/${stats.totalTasks}` : '0/0'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Streak Progress</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 flex space-x-1">
                      {[...Array(7)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-6 flex-1 rounded ${
                            i < (stats?.currentStreak % 7) ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats ? `${stats.currentStreak}/7` : '0/7'} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Tasks</h2>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id}
                      className="border-l-4 pl-4 py-2"
                      style={{
                        borderColor: 
                          task.status === 'completed' ? '#10B981' : 
                          task.status === 'failed' ? '#EF4444' : '#6366F1'
                      }}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : task.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Staked: {task.stakedAmount} ETH • Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No tasks yet. Create your first task!</p>
                  <button 
                    onClick={() => setActiveTab('new-task')}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    Create Task
                  </button>
                </div>
              )}
              {tasks.length > 3 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setActiveTab('my-tasks')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    View all tasks
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'new-task' && (
          <TaskForm onTaskCreated={handleTaskCreated} userAddress={user.address} />
        )}
        
        {activeTab === 'my-tasks' && (
          <TaskList tasks={tasks} onTaskUpdated={handleTaskCreated} />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchTasks();

      // Real-time updates
      socket.on("taskAdded", () => { fetchTasks(); fetchAnalytics(); });
      socket.on("taskUpdated", () => { fetchTasks(); fetchAnalytics(); });
      socket.on("taskDeleted", () => { fetchTasks(); fetchAnalytics(); });

      return () => {
        socket.off("taskAdded");
        socket.off("taskUpdated");
        socket.off("taskDeleted");
      };
    }
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data.data || {});
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (taskId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, status: 'completed', completedAt: new Date() } : task
        )
      );
      alert(res.data.message);
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to mark task completed');
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Safe array checks
  const statusBreakdown = Array.isArray(analytics?.statusBreakdown) ? analytics.statusBreakdown : [];
  const priorityBreakdown = Array.isArray(analytics?.priorityBreakdown)
    ? Array.isArray(analytics.priorityBreakdown) ? analytics.priorityBreakdown : Object.entries(analytics.priorityBreakdown).map(([key, value]) => ({ _id: key, count: value }))
    : [];

  const totalTasks = analytics?.totalTasks || tasks.length;

  if (totalTasks === 0) {
    return <div className="text-center text-gray-500 py-10">No tasks available to display</div>;
  }

  const statusChartData = {
    labels: statusBreakdown.map(item => item._id ?? 'Unknown'),
    datasets: [{
      label: 'Tasks by Status',
      data: statusBreakdown.map(item => item.count ?? 0),
      backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
    }]
  };

  const priorityChartData = {
    labels: priorityBreakdown.map(item => item._id ?? 'Unknown'),
    datasets: [{
      label: 'Tasks by Priority',
      data: priorityBreakdown.map(item => item.count ?? 0),
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    }]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Tasks List - Fixed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tasks.length > 0 ? tasks.map(task => (
          <div key={task._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{task.title}</h2>
              <p className="text-gray-700 capitalize">{task.status}</p>
            </div>
            {task.status !== 'completed' && (
              <div className="mt-4">
                <button
                  onClick={() => markCompleted(task._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full text-center text-gray-500 py-10">No tasks to display</div>
        )}
      </div>

      {/* Charts Section - Fixed Layout and Sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {statusBreakdown.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Task Status</h3>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut 
                  data={statusChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500 h-80 flex items-center justify-center">
            No status data to display
          </div>
        )}

        {priorityBreakdown.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Priority</h3>
            <div className="h-64">
              <Bar 
                data={priorityChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500 h-80 flex items-center justify-center">
            No priority data to display
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
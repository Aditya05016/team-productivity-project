import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // import your auth context

export const useTasks = () => {
  const { token } = useAuth(); // get token from context
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchTasks = async (params = {}) => {
    if (!token) return; // stop if no token
    try {
      setLoading(true);
      const queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data);
      setPagination(res.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => [res.data.data, ...prev]);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${id}`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.map(task => task._id === id ? res.data.data : task));
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(task => task._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  // ✅ Expose setTasks so socket events can update state directly
  return { tasks, setTasks, loading, error, pagination, fetchTasks, createTask, updateTask, deleteTask };
};

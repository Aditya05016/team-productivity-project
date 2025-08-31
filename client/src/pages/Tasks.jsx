import React, { useState, useEffect } from "react";
import { useTasks } from "../hooks/useTasks";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

const Tasks = () => {
  const {
    tasks,
    setTasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const { user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchTasks(filters);
    // 🔹 Real-time updates
    socket.on("taskCreated", (newTask) =>
      setTasks((prev) => [newTask, ...prev])
    );
    socket.on("taskUpdated", (updatedTask) =>
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      )
    );
    socket.on("taskDeleted", (deletedTaskId) =>
      setTasks((prev) => prev.filter((task) => task._id !== deletedTaskId))
    );
    socket.on("taskCompleted", (completedTask) =>
      setTasks((prev) =>
        prev.map((task) => (task._id === completedTask._id ? completedTask : task))
      )
    );
    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.off("taskCompleted");
    };
  }, [filters]);

  const refreshTasks = () => fetchTasks(filters);

  const handleCreateTask = async (taskData) => {
    const result = await createTask(taskData);
    if (result.success) setShowForm(false);
    return result;
  };

  const handleUpdateTask = async (taskData) => {
    const result = await updateTask(editingTask._id, taskData);
    if (result.success) {
      setEditingTask(null);
      setShowForm(false);
    }
    return result;
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header - Improved spacing and alignment */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 font-medium text-sm flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          New Task
        </button>
      </div>

      {/* Filters - Improved container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <TaskFilters filters={filters} onFilterChange={setFilters} />
        </div>
      </div>

      {/* Task Form - Conditional with better styling */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <div className="p-6">
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Task List - Improved container and spacing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <TaskList
            tasks={tasks}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            currentUser={currentUser}
            refreshTasks={refreshTasks}
          />
        </div>
      </div>
    </div>
  );
};

export default Tasks;
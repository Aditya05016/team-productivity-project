import React from "react";
import { format } from "date-fns";
import axios from "axios";

const TaskList = ({ tasks, loading, onEdit, onDelete, currentUser, refreshTasks }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-yellow-100 text-yellow-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "bg-gray-100 text-gray-800",
      "in-progress": "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.todo;
  };

  const isOverdue = (dueDate) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  // ✅ Complete task handler
  const handleCompleteTask = async (taskId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      alert(res.data.message);
      if (refreshTasks) refreshTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error marking task completed");
    }
  };

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  // 🔹 Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">No tasks found</p>
        <p className="text-sm text-gray-500">Create a new task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 min-h-[140px]"
        >
          <div className="p-5 h-full flex flex-col">
            {/* Header Section - Fixed height for consistency */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                {/* Title and Primary Badges */}
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 min-w-0 truncate">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace("-", " ")}
                    </span>
                    {isOverdue(task.dueDate) && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500 text-white whitespace-nowrap">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions - Fixed position */}
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <button
                  onClick={() => onEdit(task)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Description - Limited height */}
            {task.description && (
              <div className="mb-3 flex-shrink-0">
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              </div>
            )}

            {/* Meta Information - Structured grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-3 flex-shrink-0">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-1">Assigned:</span>
                <span className="truncate">{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-1">Due:</span>
                <span>{format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-1">Created:</span>
                <span>{format(new Date(task.createdAt), "MMM dd, yyyy")}</span>
              </div>
            </div>

            {/* Bottom Section - Tags and Complete Action */}
            <div className="flex justify-between items-end mt-auto pt-2">
              {/* Tags */}
              <div className="flex-1 min-w-0">
                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded whitespace-nowrap"
                      >
                        #{tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                        +{task.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Complete Action */}
              {currentUser &&
                task.status !== "completed" &&
                task.assignedTo?._id === currentUser.id && (
                  <button
                    onClick={() => handleCompleteTask(task._id)}
                    className="ml-3 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium rounded transition-colors flex-shrink-0"
                  >
                    Mark as Done
                  </button>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
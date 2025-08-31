const Task = require('../models/Task');

// We'll get io from server.js
let io;
const setSocketIO = (serverIo) => {
  io = serverIo;
};

// Get all tasks
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('assignedTo', 'name email');
    } else {
      tasks = await Task.find({
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id }
        ]
      }).populate('assignedTo', 'name email');
    }

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id
    });

    if (io) io.emit("taskAdded", task);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowedFields = ['title', 'description', 'status', 'priority'];

    if (task.assignedTo.toString() === req.user.id) {
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) task[field] = req.body[field];
      });
    } else if (req.user.role === 'admin') {
      Object.assign(task, req.body);
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.save();

    if (io) io.emit("taskUpdated", task);

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    if (io) io.emit("taskDeleted", task._id);

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task analytics (fixed for all users)
const getTaskAnalytics = async (req, res) => {
  try {
    let matchQuery = {};

    if (req.user.role !== "admin") {
      matchQuery = { $or: [ { createdBy: req.user.id }, { assignedTo: req.user.id } ] };
    }

    const tasks = await Task.find(matchQuery);

    // Status breakdown
    const statusBreakdown = [];
    const priorityBreakdown = [];

    const statusMap = {};
    const priorityMap = {};

    tasks.forEach(task => {
      // Status
      const s = task.status || 'todo';
      statusMap[s] = (statusMap[s] || 0) + 1;
      // Priority
      const p = task.priority || 'normal';
      priorityMap[p] = (priorityMap[p] || 0) + 1;
    });

    for (const [key, value] of Object.entries(statusMap)) {
      statusBreakdown.push({ _id: key, count: value });
    }

    for (const [key, value] of Object.entries(priorityMap)) {
      priorityBreakdown.push({ _id: key, count: value });
    }

    // Monthly trends
    const monthlyTrendsMap = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const d = new Date(task.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyTrendsMap[key]) monthlyTrendsMap[key] = { count: 0, completed: 0, year: d.getFullYear(), month: d.getMonth() + 1 };
      monthlyTrendsMap[key].count += 1;
      if (task.status === 'completed') monthlyTrendsMap[key].completed += 1;
    });

    const monthlyTrends = Object.values(monthlyTrendsMap).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    res.json({
      success: true,
      data: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status !== 'completed').length,
        statusBreakdown,
        priorityBreakdown,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a task as completed
const markTaskComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = "completed";
    await task.save();

    if (io) io.emit("taskUpdated", task);

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskAnalytics,
  markTaskComplete,
  setSocketIO
};

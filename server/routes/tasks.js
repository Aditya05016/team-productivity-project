const express = require('express');
const {
  getTasks,
  createTask,
  getTaskAnalytics,
  updateTask,
  deleteTask,
  markTaskComplete
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Protect all routes

// ✅ Attach io to req
router.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

// ✅ Get & Create tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

// ✅ Task analytics
router.route('/analytics')
  .get(getTaskAnalytics);

// ✅ Update task
router.put('/:id', updateTask);

// ✅ Delete task
router.delete('/:id', deleteTask);

// ✅ Mark task as completed
router.patch('/:id/complete', markTaskComplete);

module.exports = router;

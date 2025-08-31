const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name email role');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
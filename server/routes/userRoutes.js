const express = require('express');
const { getUsers, getCurrentUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/me', protect, getCurrentUser);

module.exports = router;

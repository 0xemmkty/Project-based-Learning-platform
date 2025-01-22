const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  getUserProjects 
} = require('../controllers/usercontroller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/projects', auth, getUserProjects);

module.exports = router; 
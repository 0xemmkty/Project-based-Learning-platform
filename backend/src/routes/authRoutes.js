const express = require('express');
const { register, login, verifyToken } = require('../controllers/authcontroller');
const auth = require('../middleware/auth');
console.log("enter into authrouter")
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', auth, verifyToken);

module.exports = router; 
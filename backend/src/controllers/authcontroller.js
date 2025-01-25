const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { validateEmail, validatePassword } = require('../utils/validators');
const { jwtSecret, jwtExpiration } = require('../config/auth');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log(email+" ,"+password+","+name);
    // Validate input

    if(!validateEmail(email)) {
      return res.status(400).json({ error: 'Email is not validate!' });
    };
    console.log("---------------------");

    if(!validatePassword(password)) {
      return res.status(400).json({ error: 'Password is at lest 8 char!' });
    };
    // Check if user exists
    console.log("------------"+email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    //console.log("existingUser = "+existingUser.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.log("-------------Email is OK!------------");
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institution: true
      }
    });
    console.log("---------------create OK!-----------")
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiration }
    );
    
    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: {email, password} });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institution: true,
        password: true
      }
    });
    console.log(user);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(password);
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(isValidPassword);
    if (!isValidPassword) {
      console.log("password is bad");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiration }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institution: user.institution
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        institution: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Error verifying token' });
  }
};

module.exports = {
  register,
  login,
  verifyToken
}; 
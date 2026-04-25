const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { first_name, middle_name, last_name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // Get the next user_id
    const lastUser = await prisma.users.findFirst({
      orderBy: { user_id: 'desc' }
    });
    const nextUserId = (lastUser?.user_id || 0) + 1;

    // Create user
    const user = await prisma.users.create({
      data: {
        user_id: nextUserId,
        first_name,
        middle_name,
        last_name,
        email,
        password: hashedPassword
      }
    });

    // If customer, create customer record
    if (role === 'customer') {
      await prisma.customer.create({
        data: {
          user_id: user.user_id,
          balance: 0
        }
      });
    }

    // If staff, create staff record (requires job_title)
    if (role === 'staff') {
      await prisma.staff.create({
        data: {
          user_id: user.user_id,
          job_title: req.body.job_title || 'Employee'
        }
      });
    }

    res.status(201).json({ message: 'User registered successfully', userId: user.user_id });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with customer and staff relations
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        customer: true,
        staff: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Determine role based on which record exists
    const role = user.customer ? 'customer' : user.staff ? 'staff' : 'unknown';

    // Create JWT token
    const token = jwt.sign(
      { userId: user.user_id, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login successful', token, role });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
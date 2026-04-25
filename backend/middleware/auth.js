const jwt = require('jsonwebtoken');

// Verify token - checks if user is logged in
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

// Check if user is a customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied. Customers only.' });
  }
  next();
};

// Check if user is staff
const isStaff = (req, res, next) => {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ error: 'Access denied. Staff only.' });
  }
  next();
};

// Check if user is accessing their own data
const isOwner = (req, res, next) => {
  const requestedUserId = parseInt(req.params.user_id);
  if (req.user.userId !== requestedUserId) {
    return res.status(403).json({ error: 'Access denied. You can only access your own data.' });
  }
  next();
};

module.exports = { verifyToken, isCustomer, isStaff, isOwner };
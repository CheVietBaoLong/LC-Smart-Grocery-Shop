const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customer');
const staffRoutes = require('./routes/staff')

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/staff', staffRoutes);


// Test route
app.get('/', (req, res) => {
    res.send('Grocery API is running!')
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
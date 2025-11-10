require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/img', express.static(path.join(__dirname, '../frontend/img')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Comet Store Server Started!');
  console.log('========================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎭 Payment Mode: Demo Mode (No setup needed!)`);
  console.log('========================================');
  console.log('\n✨ Ready to accept payments!');
  console.log('👉 Open browser: http://localhost:${PORT}');
  console.log('💳 Payment accepts any card number!');
  console.log('\n');
});

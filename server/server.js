const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (for local development)
// app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI , {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('Please check your MongoDB URI and network connection');
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/income', require('./routes/income'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/borrowings', require('./routes/borrowings'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Budget Buddy API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log useful context for debugging
  console.error('Unhandled error on', req.method, req.originalUrl);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error(err.stack);

  const payload = {
    message: err.message || 'Something went wrong!'
  };

  // Include stack in non-production for debugging
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(payload);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add expense
const addExpense = async (req, res) => {
  try {
    const { amount, category, paymentMode, date, note } = req.body;
    const userId = req.user.userId;

    // Handle file attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
    }

    const expense = new Expense({
      user: userId,
      amount: parseFloat(amount),
      category,
      paymentMode,
      date: new Date(date),
      note,
      attachments
    });

    await expense.save();

    res.status(201).json({
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all expenses for a user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyToken,
  addExpense,
  getExpenses
};
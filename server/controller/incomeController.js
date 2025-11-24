const Income = require('../models/Income');
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

// Add income
const addIncome = async (req, res) => {
  try {
    const { amount, source, receivedIn, date, description } = req.body;
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

    const income = new Income({
      user: userId,
      amount: parseFloat(amount),
      source,
      receivedIn,
      date: new Date(date),
      description,
      attachments
    });

    await income.save();

    res.status(201).json({
      message: 'Income added successfully',
      income
    });
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all incomes for a user
const getIncomes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const incomes = await Income.find({ user: userId }).sort({ date: -1 });

    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single income
const getIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const income = await Income.findOne({ _id: id, user: userId });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update income
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const income = await Income.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true }
    );

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({
      message: 'Income updated successfully',
      income
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete income
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const income = await Income.findOneAndDelete({ _id: id, user: userId });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addIncome,
  getIncomes,
  getIncome,
  updateIncome,
  deleteIncome,
  verifyToken
};
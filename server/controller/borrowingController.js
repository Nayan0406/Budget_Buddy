const Borrowing = require('../models/Borrowing');
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

// Add borrowing
const addBorrowing = async (req, res) => {
  try {
    const { type, counterparty, amount, dueDate, notes, reminder } = req.body;
    const userId = req.user.userId;

    const borrowing = new Borrowing({
      user: userId,
      type,
      counterparty: {
        name: counterparty.name,
        contact: counterparty.contact || ''
      },
      amount: parseFloat(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || '',
      reminder: {
        enabled: reminder?.enabled || false,
        daysBefore: reminder?.daysBefore || 3
      }
    });

    await borrowing.save();

    res.status(201).json({
      message: 'Borrowing record added successfully',
      borrowing
    });
  } catch (error) {
    console.error('Error adding borrowing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all borrowings for a user
const getBorrowings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const borrowings = await Borrowing.find({ user: userId }).sort({ createdAt: -1 });

    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update borrowing (for future use - partial payments, status updates)
const updateBorrowing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const borrowing = await Borrowing.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    res.json({
      message: 'Borrowing record updated successfully',
      borrowing
    });
  } catch (error) {
    console.error('Error updating borrowing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete borrowing
const deleteBorrowing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const borrowing = await Borrowing.findOneAndDelete({ _id: id, user: userId });

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    res.json({ message: 'Borrowing record deleted successfully' });
  } catch (error) {
    console.error('Error deleting borrowing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyToken,
  addBorrowing,
  getBorrowings,
  updateBorrowing,
  deleteBorrowing
};
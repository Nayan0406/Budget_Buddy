const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  paymentMode: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
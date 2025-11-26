const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
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
  source: {
    type: String,
    required: true,
    trim: true
  },
  receivedIn: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Income', incomeSchema);
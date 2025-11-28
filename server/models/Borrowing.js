const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['borrowed', 'lent'] // 'borrowed' = user owes, 'lent' = others owe user
  },
  counterparty: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      trim: true,
      default: ''
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  remaining: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  dueDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    daysBefore: {
      type: Number,
      default: 3,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better query performance
borrowingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Borrowing', borrowingSchema);
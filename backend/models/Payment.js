const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  flatNumber: {
    type: String,
    required: true,
    trim: true
  },
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidOn: {
    type: Date,
    required: true
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate payments for same flat, month, year
paymentSchema.index({ flatNumber: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
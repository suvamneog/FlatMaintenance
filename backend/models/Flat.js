const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  flatNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flat', flatSchema);
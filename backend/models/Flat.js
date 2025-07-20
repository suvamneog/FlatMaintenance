const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  flatNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  connectedFlats: [{
    type: String,
    ref: 'Flat' 
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Flat', flatSchema);
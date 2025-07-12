require('dotenv').config();
const mongoose = require('mongoose');
const Flat = require('../models/Flat');
const User = require('../models/User');
const Payment = require('../models/Payment');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  await Flat.deleteMany({});
  await User.deleteMany({});
  await Payment.deleteMany({});

  const flats = [{ flatNumber: '101', ownerName: 'Raj', contact: '9999999999' }];
  await Flat.insertMany(flats);

  const user = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
  await user.save();

  console.log('🌱 Seed data inserted');
  mongoose.disconnect();
};

run();


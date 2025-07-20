require('dotenv').config();
const mongoose = require('mongoose');
const Flat = require('../models/Flat');
const User = require('../models/User');
const Payment = require('../models/Payment');

const generateMockData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Flat.deleteMany({}),
      User.deleteMany({}),
      Payment.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Generate 500 flats with connected groups
    const flats = [];
    const users = [];
    const payments = [];

    // Indian names for variety
    const firstNames = [
      'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikash', 'Meera', 'Arjun', 'Kavita',
      'Rohit', 'Neha', 'Suresh', 'Pooja', 'Ravi', 'Anjali', 'Deepak', 'Sita',
      'Manoj', 'Rekha', 'Anil', 'Geeta', 'Vinod', 'Shanti', 'Ramesh', 'Usha',
      'Ashok', 'Lata', 'Santosh', 'Nirmala', 'Prakash', 'Kamala', 'Dinesh', 'Radha',
      'Mahesh', 'Savita', 'Naresh', 'Pushpa', 'Yogesh', 'Manju', 'Rajendra', 'Sudha',
      'Kiran', 'Asha', 'Mohan', 'Parvati', 'Sunil', 'Lakshmi', 'Ajay', 'Saraswati',
      'Brijesh', 'Vandana', 'Hemant', 'Kalpana', 'Jagdish', 'Shobha', 'Narayan', 'Indira'
    ];

    const lastNames = [
      'Kumar', 'Sharma', 'Singh', 'Gupta', 'Jain', 'Patel', 'Reddy', 'Nair',
      'Agarwal', 'Bansal', 'Chopra', 'Malhotra', 'Kapoor', 'Verma', 'Mishra', 'Tiwari',
      'Pandey', 'Srivastava', 'Yadav', 'Chauhan', 'Thakur', 'Saxena', 'Agnihotri', 'Dubey',
      'Shukla', 'Tripathi', 'Chandra', 'Bhardwaj', 'Joshi', 'Arora', 'Bhatia', 'Sethi'
    ];

    const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    // Generate flats (1-500)
    for (let i = 1; i <= 500; i++) {
      const flatNumber = i.toString().padStart(3, '0');
      
      // Create connected flats in groups of 3
      const connectedFlats = [];
      const groupStart = Math.floor((i - 1) / 3) * 3 + 1;
      
      for (let j = groupStart; j < groupStart + 3 && j <= 500; j++) {
        if (j !== i) {
          connectedFlats.push(j.toString().padStart(3, '0'));
        }
      }

      flats.push({
        flatNumber,
        connectedFlats
      });
    }

    // Insert flats
    await Flat.insertMany(flats);
    console.log('Created 500 flats');

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@maintenance.com',
      password: 'admin123',
      role: 'admin',
      contact: '9876500000'
    });
    await admin.save();
    users.push(admin);

    // Generate users for flats (assign 80% of flats to users)
    const assignedFlats = Math.floor(500 * 0.8); // 400 flats will have users
    
    for (let i = 1; i <= assignedFlats; i++) {
      const flatNumber = i.toString().padStart(3, '0');
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName.toLowerCase()}${flatNumber}`;
      
      const user = new User({
        username,
        email: `${username}@example.com`,
        password: 'password123',
        role: 'user',
        flatNumber,
        contact: `98765${(10000 + i).toString().slice(-5)}`
      });
      
      await user.save();
      users.push(user);
    }

    console.log(`Created ${assignedFlats} users for flats`);

    // Generate payments (random payments for last 12 months)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let i = 1; i <= assignedFlats; i++) {
      const flatNumber = i.toString().padStart(3, '0');
      
      // Generate 3-8 random payments for each flat over the last 12 months
      const numPayments = Math.floor(Math.random() * 6) + 3; // 3 to 8 payments
      const paidMonths = new Set();
      
      for (let j = 0; j < numPayments; j++) {
        let monthOffset, paymentMonth, paymentYear;
        let attempts = 0;
        
        // Ensure unique month-year combinations
        do {
          monthOffset = Math.floor(Math.random() * 12);
          paymentMonth = (currentMonth - monthOffset + 12) % 12;
          paymentYear = paymentMonth > currentMonth ? currentYear - 1 : currentYear;
          attempts++;
        } while (paidMonths.has(`${paymentMonth}-${paymentYear}`) && attempts < 20);
        
        if (attempts < 20) {
          paidMonths.add(`${paymentMonth}-${paymentYear}`);
          
          // Random payment date within the month
          const daysInMonth = new Date(paymentYear, paymentMonth + 1, 0).getDate();
          const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
          const paidOn = new Date(paymentYear, paymentMonth, randomDay);
          
          // Random amount between 1200-2000 (mostly 1500)
          let amount = 1500;
          if (Math.random() < 0.3) { // 30% chance of different amount
            amount = [1200, 1300, 1400, 1600, 1700, 1800, 2000][Math.floor(Math.random() * 7)];
          }
          
          payments.push({
            flatNumber,
            month: months[paymentMonth],
            year: paymentYear,
            amount,
            paidOn,
            paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)]
          });
        }
      }
    }

    // Insert payments in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize);
      await Payment.insertMany(batch);
      console.log(`Inserted payment batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(payments.length / batchSize)}`);
    }

    console.log(`\n✅ Mock data generation completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Flats: 500`);
    console.log(`   - Users: ${users.length} (1 admin + ${assignedFlats} residents)`);
    console.log(`   - Payments: ${payments.length}`);
    console.log(`   - Unassigned flats: ${500 - assignedFlats}`);
    console.log(`\n🔑 Login credentials:`);
    console.log(`   Admin: admin / admin123`);
    console.log(`   Sample User: rajesh001 / password123`);

  } catch (error) {
    console.error('❌ Error generating mock data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
generateMockData();
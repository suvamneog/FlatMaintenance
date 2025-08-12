require('dotenv').config({ path: '../.env' }); 
const mongoose = require('mongoose');
const Flat = require('../models/Flat');
const User = require('../models/User');
const Payment = require('../models/Payment');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Indian names for realistic data
const indianNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Gupta', 'Vikram Patel',
  'Kavita Joshi', 'Ravi Agarwal', 'Meera Reddy', 'Suresh Nair', 'Anita Verma',
  'Deepak Mishra', 'Pooja Tiwari', 'Manoj Yadav', 'Rekha Sinha', 'Ashok Pandey',
  'Geeta Saxena', 'Ramesh Chandra', 'Sushma Kapoor', 'Vinod Malhotra', 'Neha Arora',
  'Sanjay Bhatt', 'Ritu Chopra', 'Prakash Jain', 'Shilpa Mehta', 'Ajay Thakur',
  'Vandana Shah', 'Rohit Bansal', 'Seema Agrawal', 'Naveen Kumar', 'Preeti Goyal',
  'Mukesh Gupta', 'Asha Rani', 'Dinesh Sharma', 'Kiran Bala', 'Sunil Rastogi',
  'Mamta Devi', 'Pankaj Srivastava', 'Nisha Kumari', 'Rajeev Tripathi', 'Usha Yadav',
  'Anil Dubey', 'Savita Singh', 'Hemant Jha', 'Renu Mishra', 'Satish Pandey',
  'Lata Sharma', 'Mohan Lal', 'Sudha Gupta', 'Brijesh Kumar', 'Manju Devi',
  'Yogesh Tiwari', 'Sunita Rani', 'Rakesh Agarwal', 'Pushpa Devi', 'Narendra Singh',
  'Kamala Devi', 'Subhash Chandra', 'Radha Rani', 'Mahesh Kumar', 'Sarita Sharma',
  'Arun Kumar', 'Poonam Gupta', 'Jagdish Prasad', 'Sita Devi', 'Ramesh Kumar',
  'Nirmala Devi', 'Shyam Sundar', 'Urmila Sharma', 'Gopal Singh', 'Shanti Devi',
  'Bharat Kumar', 'Kanta Devi', 'Vijay Singh', 'Saroj Devi', 'Hari Om',
  'Shakuntala Devi', 'Krishna Kumar', 'Gayatri Devi', 'Mohan Singh', 'Lakshmi Devi',
  'Raman Kumar', 'Saraswati Devi', 'Ganga Ram', 'Durga Devi', 'Shiv Kumar',
  'Parvati Devi', 'Ram Kumar', 'Sita Ram', 'Hanuman Singh', 'Radha Krishna',
  'Arjun Singh', 'Draupadi Devi', 'Bhim Singh', 'Kunti Devi', 'Yudhishthir Kumar',
  'Gandhari Devi', 'Karna Singh', 'Subhadra Devi', 'Abhimanyu Kumar', 'Uttara Devi',
  'Indra Kumar', 'Saraswati Sharma', 'Vishnu Patel', 'Lakshmi Gupta', 'Brahma Singh',
  'Parvati Verma', 'Shiva Agarwal', 'Durga Mishra', 'Ganesha Tiwari', 'Kali Yadav',
  'Surya Kumar', 'Chandra Sharma', 'Vayu Singh', 'Prithvi Patel', 'Agni Gupta',
  'Varuna Verma', 'Kubera Agarwal', 'Yama Mishra', 'Kartikeya Tiwari', 'Murugan Yadav'
];

// Payment modes
const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'];

// Generate random phone number
const generatePhone = () => {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + remaining;
};

// Generate random email
const generateEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = name.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 100);
  return `${username}@${domain}`;
};

// Generate mock data
const generateMockData = async () => {
  try {
    console.log('Starting mock data generation...');

    // Clear existing data except admin
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Flat.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data (kept admin users)');

    // Generate 500 flats
    const flats = [];
    const users = [];
    
    for (let i = 1; i <= 500; i++) {
      const flatNumber = i.toString().padStart(3, '0');
      const ownerName = indianNames[Math.floor(Math.random() * indianNames.length)];
      
      // Create connected flats (every 3 flats are connected)
      const connectedFlats = [];
      const groupStart = Math.floor((i - 1) / 3) * 3 + 1;
      for (let j = 0; j < 3; j++) {
        const connectedFlatNum = (groupStart + j).toString().padStart(3, '0');
        if (connectedFlatNum !== flatNumber && (groupStart + j) <= 500) {
          connectedFlats.push(connectedFlatNum);
        }
      }

      const flat = new Flat({
        flatNumber,
        connectedFlats
      });

      flats.push(flat);

      // Create user for 80% of flats
      if (Math.random() > 0.2) {
        const user = new User({
          username: ownerName.toLowerCase().replace(/\s+/g, '') + flatNumber,
          email: generateEmail(ownerName),
          password: 'password123',
          role: 'user',
          flatNumber,
          contact: generatePhone()
        });
        users.push(user);
      }
    }

    // Save flats and users
    await Flat.insertMany(flats);
    
    for (const user of users) {
      await user.save(); // Save individually to trigger password hashing
    }
    
    console.log(`Created ${flats.length} flats and ${users.length} users`);

    // Generate payment history for the last 12 months
    const payments = [];
    const currentDate = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    for (const user of users) {
      // Generate 3-8 random payments for each user over the last 12 months
      const numPayments = Math.floor(Math.random() * 6) + 3;
      const paidMonths = new Set();

      for (let p = 0; p < numPayments; p++) {
        let month, year;
        let monthName;
        
        do {
          const monthsBack = Math.floor(Math.random() * 12);
          const paymentDate = new Date();
          paymentDate.setMonth(paymentDate.getMonth() - monthsBack);
          
          month = paymentDate.getMonth();
          year = paymentDate.getFullYear();
          monthName = months[month];
        } while (paidMonths.has(`${year}-${monthName}`));

        paidMonths.add(`${year}-${monthName}`);

        const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
        const amount = 1500 + (Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0);
        
        // Random payment date within the month
        const paymentDay = Math.floor(Math.random() * 28) + 1;
        const paidOn = new Date(year, month, paymentDay);

        const payment = new Payment({
          flatNumber: user.flatNumber,
          month: monthName,
          year,
          amount,
          paymentMode,
          paidOn
        });

        payments.push(payment);
      }
    }

    // Save payments
    await Payment.insertMany(payments);
    console.log(`Created ${payments.length} payment records`);

    console.log('\n=== MOCK DATA GENERATION COMPLETE ===');
    console.log(`✅ Created 500 flats`);
    console.log(`✅ Created ${users.length} users (80% occupancy)`);
    console.log(`✅ Created ${payments.length} payment records`);
    console.log(`✅ Connected flats in groups of 3`);
    console.log('\nSample login credentials:');
    console.log('Admin: admin / admin123');
    console.log('Users: password123 for all users');
    console.log('\nSample user credentials:');
    
    // Show first 5 user credentials
    const sampleUsers = users.slice(0, 5);
    sampleUsers.forEach(user => {
      console.log(`- Username: ${user.username} | Email: ${user.email} | Flat: ${user.flatNumber}`);
    });

  } catch (error) {
    console.error('Error generating mock data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  generateMockData();
});
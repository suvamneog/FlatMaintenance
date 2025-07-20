require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maintenance-system');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  flatNumber: { type: String, required: true }
}, { timestamps: true });

// Flat Schema
const flatSchema = new mongoose.Schema({
  flatNumber: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  isOccupied: { type: Boolean, default: true },
  connectedFlats: [{ type: String }],
  monthlyMaintenance: { type: Number, default: 1500 }
}, { timestamps: true });

// Payment Schema
const paymentSchema = new mongoose.Schema({
  flatNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  transactionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  paidBy: { type: String, required: true },
  paidOn: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Flat = mongoose.model('Flat', flatSchema);
const Payment = mongoose.model('Payment', paymentSchema);

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
  'Gandhari Devi', 'Karna Singh', 'Subhadra Devi', 'Abhimanyu Kumar', 'Uttara Devi'
];

// Payment modes
const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online', 'Card'];

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

// Generate random transaction ID
const generateTransactionId = () => {
  return 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Generate mock data
const generateMockData = async () => {
  try {
    console.log('Starting mock data generation...');

    // Clear existing data
    await User.deleteMany({});
    await Flat.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@maintenance.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      flatNumber: 'ADMIN'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Generate 500 flats
    const flats = [];
    const users = [];
    
    for (let i = 1; i <= 500; i++) {
      const flatNumber = i.toString().padStart(3, '0');
      const ownerName = indianNames[Math.floor(Math.random() * indianNames.length)];
      const ownerEmail = generateEmail(ownerName);
      const ownerPhone = generatePhone();
      
      // Create connected flats (every 3 flats are connected)
      const connectedFlats = [];
      const groupStart = Math.floor((i - 1) / 3) * 3 + 1;
      for (let j = 0; j < 3; j++) {
        const connectedFlatNum = (groupStart + j).toString().padStart(3, '0');
        if (connectedFlatNum !== flatNumber) {
          connectedFlats.push(connectedFlatNum);
        }
      }

      const flat = new Flat({
        flatNumber,
        ownerName,
        ownerEmail,
        ownerPhone,
        isOccupied: Math.random() > 0.2, // 80% occupancy rate
        connectedFlats,
        monthlyMaintenance: Math.random() > 0.9 ? 2000 : 1500 // 10% have higher maintenance
      });

      flats.push(flat);

      // Create user for occupied flats (80% of flats)
      if (flat.isOccupied && Math.random() > 0.2) {
        const userPassword = await bcrypt.hash('password123', 10);
        const user = new User({
          name: ownerName,
          email: ownerEmail,
          password: userPassword,
          phone: ownerPhone,
          role: 'user',
          flatNumber
        });
        users.push(user);
      }
    }

    // Save flats and users
    await Flat.insertMany(flats);
    await User.insertMany(users);
    console.log(`Created ${flats.length} flats and ${users.length} users`);

    // Generate payment history for the last 12 months
    const payments = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (const flat of flats) {
      if (!flat.isOccupied) continue;

      // Generate 3-8 random payments for each flat over the last 12 months
      const numPayments = Math.floor(Math.random() * 6) + 3;
      const paidMonths = new Set();

      for (let p = 0; p < numPayments; p++) {
        let month, year;
        do {
          const monthsBack = Math.floor(Math.random() * 12);
          const paymentDate = new Date(currentYear, currentMonth - 1 - monthsBack, 1);
          month = paymentDate.getMonth() + 1;
          year = paymentDate.getFullYear();
        } while (paidMonths.has(`${year}-${month}`));

        paidMonths.add(`${year}-${month}`);

        const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
        const amount = flat.monthlyMaintenance + (Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0);
        
        // Random payment date within the month
        const paymentDay = Math.floor(Math.random() * 28) + 1;
        const paidOn = new Date(year, month - 1, paymentDay);

        const payment = new Payment({
          flatNumber: flat.flatNumber,
          amount,
          month,
          year,
          paymentMode,
          transactionId: paymentMode !== 'Cash' ? generateTransactionId() : undefined,
          status: 'completed',
          paidBy: flat.ownerName,
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
    console.log(`✅ Created 1 admin user`);
    console.log(`✅ Created ${payments.length} payment records`);
    console.log(`✅ Connected flats in groups of 3`);
    console.log('\nLogin credentials:');
    console.log('Admin: admin@maintenance.com / admin123');
    console.log('Users: Any generated email / password123');
    console.log('\nSample user emails:');
    
    // Show first 5 user emails
    const sampleUsers = users.slice(0, 5);
    sampleUsers.forEach(user => {
      console.log(`- ${user.email} (Flat ${user.flatNumber})`);
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
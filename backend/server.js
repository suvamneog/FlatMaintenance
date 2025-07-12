const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Flat = require('./models/Flat');
const Payment = require('./models/Payment');
const User = require('./models/User');

// Import middleware
const { generateToken, authenticateToken, requireAdmin, canAccessFlat } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maintenance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Auth Routes

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, flatNumber, contact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Validate flat only if role is user
    if (role === 'user') {
      const flat = await Flat.findOne({ flatNumber });
      if (!flat) {
        return res.status(400).json({ message: 'Flat does not exist. Please contact the admin.' });
      }

      const flatAssigned = await User.findOne({ flatNumber, isActive: true });
      if (flatAssigned) {
        return res.status(400).json({ message: 'Flat is already assigned to another user' });
      }
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      flatNumber: role === 'user' ? flatNumber : undefined,
      contact : contact
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email and explicitly select password
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    }).select('+password'); // This is crucial!

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get user without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin Routes

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user active status (admin only)
app.put('/api/admin/users/:userId/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Flat Routes

// Get all flats (admin can see all, users can see only their flat)
app.get('/api/flats', authenticateToken, async (req, res) => {
  try {
    let flats;
    if (req.user.role === 'admin') {
      const allFlats = await Flat.find().sort({ flatNumber: 1 });

      // Get users mapped by flatNumber
      const users = await User.find({ isActive: true });
      const userMap = {};
      users.forEach(user => {
        if (user.flatNumber) {
          userMap[user.flatNumber] = user;
        }
      });

      // Add owner info from users
      flats = allFlats.map(flat => {
        const user = userMap[flat.flatNumber];
        return {
          ...flat.toObject(),
          ownerName: user?.username || '',
          contact: user?.contact || '',
        };
      });

    } else {
      // For users, return only their flat
      const flat = await Flat.findOne({ flatNumber: req.user.flatNumber });
      flats = [{
        ...flat.toObject(),
        ownerName: req.user.username,
        contact: req.user.contact,
      }];
    }

    res.json(flats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new flat (admin only)
app.post('/api/flats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { flatNumber } = req.body;
console.log('Incoming Flat Payload:', req.body);
    if (!flatNumber) {
      return res.status(400).json({ message: 'Flat number is required' });
    }

    const existingFlat = await Flat.findOne({ flatNumber });
    if (existingFlat) {
      return res.status(400).json({ message: 'Flat already exists' });
    }

    const flat = new Flat({ flatNumber }); // Only flatNumber now
    const savedFlat = await flat.save();
    res.status(201).json(savedFlat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get only unassigned flats (for signup dropdown)
app.get('/api/flats/available', async (req, res) => {
  try {
    const assignedFlats = await User.find({ isActive: true }, 'flatNumber');
    const assignedFlatNumbers = assignedFlats.map(u => u.flatNumber);

    const availableFlats = await Flat.find({
      flatNumber: { $nin: assignedFlatNumbers }
    }).sort({ flatNumber: 1 });

    res.json(availableFlats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get flat by number (admin or flat owner)
app.get('/api/flats/:flatNumber', authenticateToken, canAccessFlat, async (req, res) => {
  try {
    const flat = await Flat.findOne({ flatNumber: req.params.flatNumber });
    if (!flat) return res.status(404).json({ message: 'Flat not found' });

    // Find the active user assigned to this flat
    const user = await User.findOne({ flatNumber: req.params.flatNumber, isActive: true });

    // Merge user details (if found) into flat object
    const flatWithUser = {
      ...flat.toObject(),
      ownerName: user?.username || 'Unassigned',
      contact: user?.contact || 'N/A'
    };

    res.json(flatWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Clear flat owner (admin only)
app.put('/api/flats/:flatNumber/clear-owner', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const flatNumber = req.params.flatNumber;
    const user = await User.findOne({ flatNumber, isActive: true });

    if (!user) {
      return res.status(404).json({ message: 'No active user assigned to this flat' });
    }

    await user.deleteOne(); // OR you can use user.isActive = false; await user.save(); if you want soft-delete

    res.json({ success: true, message: 'Owner cleared from flat' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const deletedUser = await User.findByIdAndDelete(req.params.userId);
//     if (!deletedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Payment Routes

// Get all payments (admin can see all, users can see only their flat's payments)
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { flatNumber, month, year } = req.query;
    let filter = {};
    
    if (req.user.role === 'user') {
      filter.flatNumber = req.user.flatNumber;
    }
    
    if (flatNumber && req.user.role === 'admin') filter.flatNumber = flatNumber;
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);
    
    const payments = await Payment.find(filter).sort({ paidOn: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new payment (admin can add for any flat, users can add only for their flat)
app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { flatNumber } = req.body;

    // Check if user can add payment for this flat
    if (req.user.role === 'user' && req.user.flatNumber !== flatNumber) {
      return res.status(403).json({ message: 'You can only add payments for your own flat' });
    }

    // Check if flat exists
    const flatExists = await Flat.findOne({ flatNumber });
    if (!flatExists) {
      return res.status(400).json({ message: 'Flat does not exist' });
    }

    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Payment already exists for this flat, month, and year' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Get payments by flat number (admin or flat owner)
app.get('/api/payments/flat/:flatNumber', authenticateToken, canAccessFlat, async (req, res) => {
  try {
    const payments = await Payment.find({ flatNumber: req.params.flatNumber }).sort({ year: -1, month: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete payment (admin only)
app.delete('/api/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/seed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Clear existing data
    await Promise.all([
      Flat.deleteMany({}),
      Payment.deleteMany({}),
      User.deleteMany({})
    ]);

    // Insert sample flats
    const flats = [
      { flatNumber: '101' },
      { flatNumber: '102' },
      { flatNumber: '103' },
      { flatNumber: '201' },
      { flatNumber: '202' },
      { flatNumber: '203' },
      { flatNumber: '301' },
      { flatNumber: '302' },
    ];
    await Flat.insertMany(flats);

    // Create users - MUST use individual saves for password hashing
    const createUser = async (userData) => {
      const user = new User(userData);
      await user.save();
      return user;
    };

    // Create admin user
    await createUser({
      username: 'admin',
      email: 'admin@maintenance.com',
      password: 'admin123',
      role: 'admin',
      contact: '9876500000'
    });

    // Create regular users
    const users = [
      {
        username: 'rajesh101',
        email: 'rajesh@example.com',
        password: 'password123',
        role: 'user',
        flatNumber: '101',
        contact: '9876512345'
      },
      {
        username: 'priya102',
        email: 'priya@example.com',
        password: 'password123',
        role: 'user',
        flatNumber: '102',
        contact: '9876523456'
      },
      {
        username: 'amit103',
        email: 'amit@example.com',
        password: 'password123',
        role: 'user',
        flatNumber: '103',
        contact: '9876534567'
      }
    ];

    for (const userData of users) {
      await createUser(userData);
    }

    // Insert sample payments
    const payments = [
      { flatNumber: '101', month: 'January', year: 2024, amount: 1500, paidOn: new Date('2024-01-05'), paymentMode: 'UPI' },
      { flatNumber: '101', month: 'February', year: 2024, amount: 1500, paidOn: new Date('2024-02-03'), paymentMode: 'Cash' },
      { flatNumber: '102', month: 'January', year: 2024, amount: 1500, paidOn: new Date('2024-01-10'), paymentMode: 'Bank Transfer' }
    ];
    await Payment.insertMany(payments);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      credentials: {
        admin: { username: 'admin', password: 'admin123' },
        sampleUser: { username: 'rajesh101', password: 'password123' }
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Database seeding failed',
      error: error.message
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
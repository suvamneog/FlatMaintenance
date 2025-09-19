# Maintenance Payment Tracking System

A comprehensive web application for managing apartment maintenance payments with role-based access control, built with React.js frontend and Node.js/Express backend.

## 🏗️ Project Overview

This system allows apartment administrators to manage flats, track maintenance payments, and provides residents with an easy way to view their payment history and make new payments. The application features a modern, responsive design with real-time data management.

### Key Features

- **Role-Based Authentication**: Separate interfaces for administrators and residents
- **Payment Management**: Track monthly maintenance payments with multiple payment modes
- **Flat Management**: Organize flats in connected groups for better management
- **Real-time Dashboard**: Visual statistics and payment status tracking
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Export**: Export payment and user data to PDF and CSV formats
- **Payment Alerts**: Automatic notifications for overdue payments

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Additional Libraries
- **jsPDF** - PDF generation
- **jsPDF-AutoTable** - Table generation for PDFs
- **File-Saver** - File download functionality
- **Faker.js** - Generate mock data for testing

## 📁 Project Structure

```
maintenance-payment-system/
├── backend/                    # Backend API server
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/
│   │   ├── Flat.js           # Flat data model
│   │   ├── Payment.js        # Payment data model
│   │   └── User.js           # User data model
│   ├── scripts/
│   │   └── seed.js           # Database seeding script
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend documentation
├── src/                       # Frontend React application
│   ├── components/           # React components
│   │   ├── AddPayment.jsx    # Payment form component
│   │   ├── AdminAddFlat.jsx  # Admin flat creation
│   │   ├── AdminPanel.jsx    # Admin dashboard
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── FlatDetails.jsx   # Individual flat view
│   │   ├── Header.jsx        # Navigation header
│   │   ├── Login.jsx         # Login form
│   │   └── Register.jsx      # Registration form
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── data/
│   │   └── sampleData.js     # Sample data for development
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── public/                    # Static assets
├── package.json              # Frontend dependencies
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
├── vercel.json               # Deployment configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maintenance-payment-system
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/maintenance_system
   JWT_SECRET=your-secret-key-change-in-production
   PORT=5001
   ```

   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB installation
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   ```

8. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

### Initial Setup

1. **Seed the database** (optional)
   
   You can populate the database with sample data by making a POST request to the seed endpoint:
   ```bash
   curl -X POST http://localhost:5001/api/seed
   ```

2. **Create admin account**
   
   Register a new account and select "Administrator" as the account type.

## 👥 User Roles & Features

### Administrator Features

- **Dashboard Overview**
  - View total flats, paid/pending statistics
  - Group-wise payment tracking
  - Visual progress indicators

- **User Management**
  - View all registered users
  - Activate/deactivate user accounts
  - Monitor user activity

- **Flat Management**
  - Add new flats to the system
  - View flat details and payment history
  - Manage flat connections and groupings
  - Clear owner information

- **Payment Management**
  - View all payments across all flats
  - Filter payments by month, year, or flat
  - Add payments for any flat
  - Delete payment records

- **Data Export**
  - Export user data to PDF/CSV
  - Export payment reports
  - Generate monthly/yearly reports

### Resident Features

- **Personal Dashboard**
  - View payment status for current month
  - See overdue payment alerts
  - Quick payment submission

- **Payment History**
  - View complete payment history
  - Track payment modes and dates
  - Download payment receipts

- **Payment Submission**
  - Submit new maintenance payments
  - Multiple payment mode options
  - Automatic validation and confirmation

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'user']),
  flatNumber: String (required for users),
  contact: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Flat Model
```javascript
{
  flatNumber: String (unique, required),
  connectedFlats: [String] (array of flat numbers),
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model
```javascript
{
  flatNumber: String (required),
  month: String (enum: months, required),
  year: Number (2020-2030, required),
  amount: Number (min: 0, required),
  paidOn: Date (required),
  paymentMode: String (enum: payment modes, required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Security

- **JWT-based authentication** with secure token storage
- **Password hashing** using bcryptjs with salt rounds
- **Role-based access control** for different user types
- **Protected routes** on both frontend and backend
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests

## 📊 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Flat Management Routes
- `GET /api/flats` - Get all flats (role-based filtering)
- `POST /api/flats` - Create new flat (admin only)
- `GET /api/flats/:flatNumber` - Get specific flat details
- `GET /api/flats/available` - Get unassigned flats
- `PUT /api/flats/:flatNumber/clear-owner` - Clear flat owner (admin only)
- `PUT /api/flats/:flatNumber/connect` - Connect flats (admin only)

### Payment Routes
- `GET /api/payments` - Get payments (with filtering)
- `POST /api/payments` - Create new payment
- `GET /api/payments/flat/:flatNumber` - Get payments for specific flat
- `DELETE /api/payments/:id` - Delete payment (admin only)

### Admin Routes
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:userId/toggle` - Toggle user status (admin only)

## 🎨 UI/UX Features

### Design System
- **Modern gradient backgrounds** with blue and purple themes
- **Consistent color palette** with proper contrast ratios
- **Responsive grid layouts** for all screen sizes
- **Interactive hover states** and smooth transitions
- **Loading states** and error handling
- **Toast notifications** for user feedback

### Components
- **Reusable card components** with consistent styling
- **Form components** with validation and error states
- **Table components** with sorting and pagination
- **Modal dialogs** for confirmations and forms
- **Navigation components** with role-based visibility

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

Key responsive features:
- Collapsible navigation on mobile
- Stacked layouts for smaller screens
- Touch-friendly button sizes
- Optimized table views for mobile

## 🔧 Development Features

### Hot Reload
- Frontend hot reload with Vite
- Backend auto-restart with nodemon

### Code Organization
- Modular component structure
- Separation of concerns
- Reusable utility functions
- Consistent naming conventions

### Error Handling
- Comprehensive error boundaries
- API error handling with user-friendly messages
- Form validation with real-time feedback
- Network error recovery

## 📈 Performance Optimizations

- **Code splitting** with React lazy loading
- **Image optimization** with proper sizing
- **API response caching** where appropriate
- **Efficient database queries** with proper indexing
- **Minified production builds**

## 🚀 Deployment

### Frontend Deployment (Vercel)
The frontend is configured for deployment on Vercel with automatic builds from the main branch.

### Backend Deployment
The backend can be deployed on various platforms:
- **Vercel** (serverless functions)
- **Heroku** (container deployment)
- **DigitalOcean** (VPS deployment)
- **AWS** (EC2 or Lambda)

### Environment Variables for Production
```env
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maintenance_system
JWT_SECRET=your-production-secret-key
PORT=5001

# Frontend
VITE_API_URL=https://your-backend-domain.com/api
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Admin panel functionality
- [ ] Payment submission and tracking
- [ ] Flat management operations
- [ ] Data export functionality
- [ ] Responsive design on different devices

### Sample Test Data
The application includes a seeding script that creates:
- 500 sample flats with realistic numbering
- Sample users with different roles
- Payment history for the last 12 months
- Connected flat relationships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/backend/README.md` file
- Review the API endpoints and data models

## 🔮 Future Enhancements

- **Email notifications** for payment reminders
- **SMS integration** for payment alerts
- **Payment gateway integration** (Stripe, Razorpay)
- **Mobile app** development with React Native
- **Advanced reporting** with charts and analytics
- **Bulk payment import** from CSV files
- **Multi-language support**
- **Dark mode** theme option

---

**Built with ❤️ using React.js and Node.js**
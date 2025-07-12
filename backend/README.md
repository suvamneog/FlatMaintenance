# Maintenance Payment Tracking System - Backend

This is the backend API for the Maintenance Payment Tracking System built with Node.js, Express.js, and MongoDB.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string if needed
   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/maintenance_system`

4. **Run the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Seed Sample Data**
   ```bash
   # Send POST request to seed endpoint
   curl -X POST http://localhost:5000/api/seed
   ```

## API Endpoints

### Flats
- `GET /api/flats` - Get all flats
- `POST /api/flats` - Create new flat
- `GET /api/flats/:flatNumber` - Get flat by number

### Payments
- `GET /api/payments` - Get all payments (with optional query filters)
- `POST /api/payments` - Create new payment
- `GET /api/payments/flat/:flatNumber` - Get payments by flat number
- `DELETE /api/payments/:id` - Delete payment

### Authentication
- `POST /api/auth/login` - Admin login

### Development
- `POST /api/seed` - Seed database with sample data

## Models

### Flat Schema
```javascript
{
  flatNumber: String (required, unique),
  ownerName: String (required),
  contact: String (required)
}
```

### Payment Schema
```javascript
{
  flatNumber: String (required),
  month: String (required, enum),
  year: Number (required, 2020-2030),
  amount: Number (required, min: 0),
  paidOn: Date (required),
  paymentMode: String (required, enum)
}
```

## Frontend Integration

Update your React app's API calls to use these endpoints:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Get all flats
const flats = await fetch(`${API_BASE_URL}/flats`).then(r => r.json());

// Add payment
await fetch(`${API_BASE_URL}/payments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});
```
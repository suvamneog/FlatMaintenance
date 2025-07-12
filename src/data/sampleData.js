export const sampleData = {
  flats: [
    { flatNumber: '101', ownerName: 'Mr. Rajesh Kumar', contact: '9876543210' },
    { flatNumber: '102', ownerName: 'Mrs. Priya Sharma', contact: '9876543211' },
    { flatNumber: '103', ownerName: 'Mr. Amit Singh', contact: '9876543212' },
    { flatNumber: '201', ownerName: 'Dr. Sunita Gupta', contact: '9876543213' },
    { flatNumber: '202', ownerName: 'Mr. Vikash Jain', contact: '9876543214' },
    { flatNumber: '203', ownerName: 'Mrs. Meera Patel', contact: '9876543215' },
    { flatNumber: '301', ownerName: 'Mr. Arjun Reddy', contact: '9876543216' },
    { flatNumber: '302', ownerName: 'Mrs. Kavita Nair', contact: '9876543217' },
  ],
  payments: [
    {
      id: 1,
      flatNumber: '101',
      month: 'January',
      year: 2024,
      amount: 1500,
      paidOn: '2024-01-05',
      paymentMode: 'UPI'
    },
    {
      id: 2,
      flatNumber: '101',
      month: 'February',
      year: 2024,
      amount: 1500,
      paidOn: '2024-02-03',
      paymentMode: 'Cash'
    },
    {
      id: 3,
      flatNumber: '102',
      month: 'January',
      year: 2024,
      amount: 1500,
      paidOn: '2024-01-10',
      paymentMode: 'Bank Transfer'
    },
    {
      id: 4,
      flatNumber: '102',
      month: 'March',
      year: 2024,
      amount: 1500,
      paidOn: '2024-03-15',
      paymentMode: 'UPI'
    },
    {
      id: 5,
      flatNumber: '201',
      month: 'January',
      year: 2024,
      amount: 1500,
      paidOn: '2024-01-08',
      paymentMode: 'Cash'
    },
    {
      id: 6,
      flatNumber: '203',
      month: 'February',
      year: 2024,
      amount: 1500,
      paidOn: '2024-02-20',
      paymentMode: 'UPI'
    },
    {
      id: 7,
      flatNumber: '301',
      month: 'January',
      year: 2024,
      amount: 1500,
      paidOn: '2024-01-12',
      paymentMode: 'Bank Transfer'
    },
    {
      id: 8,
      flatNumber: '302',
      month: 'March',
      year: 2024,
      amount: 1500,
      paidOn: '2024-03-25',
      paymentMode: 'Cash'
    }
  ]
};

export const flatGraph = {
  '101': ['102'],
  '102': ['101', '103'],
  '103': ['102'],
  '201': ['202'],
  '202': ['201', '203'],
  '203': ['202'],
  '301': ['302'],
  '302': ['301']
};
import React, { useState, useEffect } from 'react';
import { Users, Shield, ToggleLeft, ToggleRight, Plus, Database, Calendar, TrendingUp, CreditCard, Search, Filter, FileText, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState({
    users: true,
    payments: true,
    stats: true
  });
  const [error, setError] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    csv: false
  });
  const itemsPerPage = 10;
  
  const { getAuthHeaders, API_BASE_URL } = useAuth();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchUsers();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (selectedMonth || selectedYear) {
      fetchPayments();
    }
  }, [selectedMonth, selectedYear]);

  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(prev => ({ ...prev, payments: true }));
      let url = `${API_BASE_URL}/payments`;
      const params = new URLSearchParams();
      
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === userId ? data.user : user
        ));
        setError('');
      } else {
        setError(data.message || 'Failed to update user status');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const seedDatabase = async () => {
    setSeedLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('Database seeded successfully!\n\n' + 
              'Admin: admin / admin123\n' + 
              'User: rajesh101 / password123');
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to seed database');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setSeedLoading(false);
    }
  };

  const getPaymentStats = () => {
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const uniqueFlats = new Set(payments.map(p => p.flatNumber)).size;
    return {
      totalPayments: payments.length,
      totalAmount,
      uniqueFlats
    };
  };

  const exportToPDF = async () => {
    setExportLoading(prev => ({ ...prev, pdf: true }));
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`${activeTab === 'users' ? 'Users' : 'Payments'} Report`, 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

      if (activeTab === 'users') {
        // Users table
        doc.autoTable({
          startY: 40,
          head: [['Username', 'Email', 'Role', 'Flat', 'Status', 'Joined']],
          body: users.map(user => [
            user.username,
            user.email,
            user.role,
            user.flatNumber || 'N/A',
            user.isActive ? 'Active' : 'Inactive',
            new Date(user.createdAt).toLocaleDateString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 }
        });
      } else {
        // Payments table
        doc.autoTable({
          startY: 40,
          head: [['Flat', 'Month', 'Year', 'Amount', 'Mode', 'Paid On']],
          body: payments.map(payment => [
            payment.flatNumber,
            payment.month,
            payment.year,
            `₹${payment.amount.toLocaleString()}`,
            payment.paymentMode,
            new Date(payment.paidOn).toLocaleDateString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [39, 174, 96] },
          styles: { fontSize: 9 }
        });
      }

      doc.save(`${activeTab}_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      setError('Error generating PDF report');
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const exportToCSV = () => {
    setExportLoading(prev => ({ ...prev, csv: true }));
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      let headers = [];
      let data = [];

      if (activeTab === 'users') {
        headers = ['Username', 'Email', 'Role', 'Flat', 'Status', 'Joined'];
        data = users.map(user => [
          `"${user.username}"`,
          `"${user.email}"`,
          user.role,
          user.flatNumber || 'N/A',
          user.isActive ? 'Active' : 'Inactive',
          new Date(user.createdAt).toLocaleDateString()
        ]);
      } else {
        headers = ['Flat', 'Month', 'Year', 'Amount', 'Mode', 'Paid On'];
        data = payments.map(payment => [
          payment.flatNumber,
          payment.month,
          payment.year,
          payment.amount,
          payment.paymentMode,
          new Date(payment.paidOn).toLocaleDateString()
        ]);
      }

      csvContent += headers.join(',') + '\n';
      data.forEach(row => {
        csvContent += row.join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError('Error generating CSV report');
    } finally {
      setExportLoading(prev => ({ ...prev, csv: false }));
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.flatNumber && user.flatNumber.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredPayments = payments.filter(payment => 
    payment.flatNumber.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    payment.paymentMode.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const totalPaymentPages = Math.ceil(filteredPayments.length / itemsPerPage);
  
  const paginatedUsers = filteredUsers.slice(
    (currentUserPage - 1) * itemsPerPage,
    currentUserPage * itemsPerPage
  );
  
  const paginatedPayments = filteredPayments.slice(
    (currentPaymentPage - 1) * itemsPerPage,
    currentPaymentPage * itemsPerPage
  );

  const paymentStats = getPaymentStats();

  if (loading.users && loading.payments && loading.stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-full p-3">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-gray-600">Manage users and system settings</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(activeTab === 'users' || activeTab === 'payments') && (
                <div className="flex space-x-2">
                  <button
                    onClick={exportToCSV}
                    disabled={exportLoading.csv}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
                      exportLoading.csv 
                        ? 'bg-green-400 text-white cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {exportLoading.csv ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        CSV
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4 mr-2" />
                        CSV
                      </>
                    )}
                  </button>
                </div>
              )}
              <Link
                to="/admin/add-flat"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Flat</span>
              </Link>
              <button
                onClick={seedDatabase}
                disabled={seedLoading}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database className="w-4 h-4" />
                <span>{seedLoading ? 'Seeding...' : 'Seed DB'}</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Payments
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">{users.length}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-green-600">
                      {users.filter(user => user.isActive).length}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Administrators</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {users.filter(user => user.role === 'admin').length}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Collection</p>
                    <p className="text-2xl font-bold text-green-600">₹{paymentStats.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/add-flat"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <div className="bg-blue-100 rounded-full p-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Add New Flat</h3>
                    <p className="text-sm text-gray-500">Register a new flat</p>
                  </div>
                </Link>
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 text-left"
                >
                  <div className="bg-purple-100 rounded-full p-2">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Manage Users</h3>
                    <p className="text-sm text-gray-500">View and edit users</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 text-left"
                >
                  <div className="bg-green-100 rounded-full p-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">View Payments</h3>
                    <p className="text-sm text-gray-500">Check payment history</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <p className="text-gray-600">Manage all system users</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loading.users ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : (
                <>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Flat</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Joined</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-800">{user.username}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.flatNumber || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleUserStatus(user._id)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {user.isActive ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                                <span className="text-sm">
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No users found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {totalUserPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{(currentUserPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentUserPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
                        <span className="font-medium">{filteredUsers.length}</span> users
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentUserPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentUserPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentUserPage(prev => Math.min(prev + 1, totalUserPages))}
                          disabled={currentUserPage === totalUserPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Payment History</h2>
                    <p className="text-gray-600">Filter and view payment records</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search payments..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Months</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{paymentStats.totalPayments}</p>
                  <p className="text-gray-600 text-sm">Total Payments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">₹{paymentStats.totalAmount.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">Total Amount</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{paymentStats.uniqueFlats}</p>
                  <p className="text-gray-600 text-sm">Flats Paid</p>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              {loading.payments ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payments...</p>
                </div>
              ) : (
                <>
                  {paginatedPayments.length > 0 ? (
                    <>
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Flat No.</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Month</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Year</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Payment Mode</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Paid On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedPayments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-800">{payment.flatNumber}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{payment.month}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{payment.year}</td>
                              <td className="px-6 py-4 text-sm font-medium text-green-600">₹{payment.amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {payment.paymentMode}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(payment.paidOn).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {totalPaymentPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{(currentPaymentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPaymentPage * itemsPerPage, filteredPayments.length)}</span> of{' '}
                            <span className="font-medium">{filteredPayments.length}</span> payments
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCurrentPaymentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPaymentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setCurrentPaymentPage(prev => Math.min(prev + 1, totalPaymentPages))}
                              disabled={currentPaymentPage === totalPaymentPages}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No payments found for the selected criteria</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
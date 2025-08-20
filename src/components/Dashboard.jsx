import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Home, Users, TrendingUp, Plus, Building2, AlertTriangle, Bell, X, CreditCard, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [flats, setFlats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [overdueMonths, setOverdueMonths] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [flatsToShow, setFlatsToShow] = useState(10);

  const { getAuthHeaders, API_BASE_URL, isAdmin, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isAdmin() && user?.flatNumber) {
      checkOverduePayments();
    }
  }, [payments, user]);

  const checkOverduePayments = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const overdue = [];
    
    // Check last 3 months including current month
    for (let i = 0; i < 3; i++) {
      const checkMonth = (currentMonth - i + 12) % 12;
      const checkYear = checkMonth > currentMonth ? currentYear - 1 : currentYear;
      const monthName = monthNames[checkMonth];
      
      const hasPaid = payments.some(p => 
        p.flatNumber === user.flatNumber && 
        p.month === monthName && 
        p.year === checkYear
      );
      
      if (!hasPaid) {
        overdue.push({ month: monthName, year: checkYear });
      }
    }
    
    setOverdueMonths(overdue);
  };

  const fetchData = async () => {
    try {
      const [flatsResponse, paymentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/flats`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/payments`, { headers: getAuthHeaders() })
      ]);

      if (flatsResponse.ok && paymentsResponse.ok) {
        const flatsData = await flatsResponse.json();
        const paymentsData = await paymentsResponse.json();

        setFlats(flatsData);
        setPayments(paymentsData);
        if (isAdmin()) {
          const groupsFromFlats = generateGroups(flatsData);
          setGroups(groupsFromFlats);
        }
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateGroups = (flatsList) => {
    const sortedFlats = flatsList
      .map(f => f.flatNumber)
      .sort((a, b) => parseInt(a) - parseInt(b));

    const groups = [];

    for (let i = 0; i < sortedFlats.length; i += 3) {
      const group = sortedFlats.slice(i, i + 3);
      groups.push(group);
    }

    return groups;
  };

  const getPaymentStatus = (flatNumber) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    return payments.some(p => 
      p.flatNumber === flatNumber && 
      p.month === monthNames[currentMonth] && 
      p.year === currentYear
    );
  };

  const filteredFlats = flats.filter(flat => {
    const matchesSearch = flat.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flat.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'due') return matchesSearch && !getPaymentStatus(flat.flatNumber);
    if (filterType === 'paid') return matchesSearch && getPaymentStatus(flat.flatNumber);
    
    return matchesSearch;
  });

  const totalFlats = flats.length;
  const paidFlats = flats.filter(flat => getPaymentStatus(flat.flatNumber)).length;
  const dueFlats = totalFlats - paidFlats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Payment Due Banner for Users */}
        {!isAdmin() && overdueMonths.length > 0 && showAlert && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Payment Due Alert</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      You have pending maintenance payments for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {overdueMonths.map((overdue, index) => (
                        <li key={index}>
                          {overdue.month} {overdue.year} - ₹1,500
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link
                        to="/add-payment"
                        className="bg-red-600 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Pay Now
                      </Link>
                      <button
                        onClick={() => setShowAlert(false)}
                        className="ml-3 bg-red-50 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-3">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {isAdmin() ? 'Maintenance Dashboard' : `Welcome, ${user?.username}`}
                </h1>
                <p className="text-gray-600">
                  {isAdmin() ? 'Manage apartment maintenance payments' : `Flat ${user?.flatNumber} - Payment Overview`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats View */}
        {!isAdmin() && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Your Flat</p>
                  <p className="text-2xl font-bold text-gray-800">{user?.flatNumber}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Current Status</p>
                  <p className={`text-2xl font-bold ${
                    getPaymentStatus(user?.flatNumber) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getPaymentStatus(user?.flatNumber) ? 'Paid' : 'Due'}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${
                  getPaymentStatus(user?.flatNumber) ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {getPaymentStatus(user?.flatNumber) ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <Link
                to="/add-payment"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Make Payment</span>
              </Link>
            </div>
          </div>
        )}

        {/* Admin Tabs and Content */}
        {isAdmin() && (
          <>
            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('flats')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'flats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Flats Management
                </button>
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Flats</p>
                        <p className="text-2xl font-bold text-gray-800">{totalFlats}</p>
                        <p className="text-xs text-gray-500 mt-1">Registered in system</p>
                      </div>
                      <div className="bg-blue-100 rounded-full p-3">
                        <Home className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Paid This Month</p>
                        <p className="text-2xl font-bold text-green-600">{paidFlats}</p>
                        <p className="text-xs text-gray-500 mt-1">{Math.round((paidFlats/totalFlats)*100)}% completion</p>
                      </div>
                      <div className="bg-green-100 rounded-full p-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Pending Dues</p>
                        <p className="text-2xl font-bold text-red-600">{dueFlats}</p>
                        <p className="text-xs text-gray-500 mt-1">Need follow up</p>
                      </div>
                      <div className="bg-red-100 rounded-full p-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Stats */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Group Statistics</h2>
                    <span className="text-sm text-gray-500">3 flats per group</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group, index) => {
                      const groupPaid = group.filter(flatNumber => getPaymentStatus(flatNumber)).length;
                      const groupDue = group.length - groupPaid;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800">Group {index + 1}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              groupDue === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {groupDue === 0 ? 'Complete' : `${groupDue} pending`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Flats: {group.join(', ')}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(groupPaid/group.length)*100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Paid: {groupPaid}</span>
                            <span>Due: {groupDue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Flats Management Tab */}
            {activeTab === 'flats' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by flat number or owner name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5 text-gray-400" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Flats</option>
                        <option value="paid">Paid This Month</option>
                        <option value="due">Pending Dues</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Flats List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">
                      Flats ({filteredFlats.length})
                    </h2>
                    <span className="text-sm text-gray-500">
                      Showing {Math.min(filteredFlats.length, flatsToShow)} of {filteredFlats.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flat No.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredFlats.slice(0, flatsToShow).map((flat) => (
                          <tr key={flat.flatNumber} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              <div className="flex items-center">
                                <Home className="w-4 h-4 mr-2 text-gray-400" />
                                {flat.flatNumber}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{flat.ownerName || 'Unassigned'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                getPaymentStatus(flat.flatNumber)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {getPaymentStatus(flat.flatNumber) ? 'Paid' : 'Due'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Link
                                to={`/flat/${flat.flatNumber}`}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredFlats.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No flats found matching your criteria</p>
                    </div>
                  )}

                  {filteredFlats.length > flatsToShow && (
                    <div className="px-4 py-3 border-t border-gray-200 text-right">
                      <button 
                        onClick={() => setFlatsToShow(filteredFlats.length)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View All ({filteredFlats.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
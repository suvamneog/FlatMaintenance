import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Home, Users, TrendingUp, Plus, Building2 } from 'lucide-react';
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

  const { getAuthHeaders, API_BASE_URL, isAdmin, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const [flatsResponse, paymentsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/flats`, {
        headers: getAuthHeaders()
      }),
      fetch(`${API_BASE_URL}/payments`, {
        headers: getAuthHeaders()
      })
    ]);

    if (flatsResponse.ok && paymentsResponse.ok) {
      const flatsData = await flatsResponse.json();
      const paymentsData = await paymentsResponse.json();

      setFlats(flatsData);
      setPayments(paymentsData);

const groupsFromFlats = generateGroups(flatsData);
setGroups(groupsFromFlats);

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
      
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-3">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isAdmin() ? 'Maintenance Dashboard' : `Welcome, ${user?.username}`}
                </h1>
                <p className="text-gray-600">
                  {isAdmin() ? 'Manage apartment maintenance payments' : `Flat ${user?.flatNumber} - Payment Management`}
                </p>
              </div>
            </div>
            <Link 
              to="/add-payment"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Payment</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {isAdmin() ? 'Total Flats' : 'Your Flat'}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {isAdmin() ? totalFlats : user?.flatNumber}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Paid This Month</p>
                <p className="text-3xl font-bold text-green-600">{paidFlats}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Dues</p>
                <p className="text-3xl font-bold text-red-600">{dueFlats}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Only show for admin */}
        {isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by flat number or owner name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Flats</option>
                  <option value="paid">Paid This Month</option>
                  <option value="due">Pending Dues</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Group Stats - Only show for admin */}
        {isAdmin() && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Group Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group, index) => {
                const groupPaid = group.filter(flatNumber => getPaymentStatus(flatNumber)).length;
                const groupDue = group.length - groupPaid;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Group {index + 1}</h3>
                    <p className="text-sm text-gray-600 mb-2">Flats: {group.join(', ')}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Paid: {groupPaid}</span>
                      <span className="text-red-600">Due: {groupDue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

       {/* Flats List */}
{isAdmin() ? (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">
        Flats ({filteredFlats.length})
      </h2>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Flat No.</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Owner Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Contact</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredFlats.map((flat) => (
            <tr key={flat.flatNumber} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">{flat.flatNumber}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{flat.ownerName}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{flat.contact}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getPaymentStatus(flat.flatNumber)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getPaymentStatus(flat.flatNumber) ? 'Paid' : 'Due'}
                </span>
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/flat/${flat.flatNumber}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : null}
      </div>
    </div>
  );
};

export default Dashboard;
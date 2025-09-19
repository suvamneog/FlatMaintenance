import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, User, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const FlatDetails = () => {
  const { flatNumber } = useParams();
  const [flat, setFlat] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allFlats, setAllFlats] = useState([]);

  const { getAuthHeaders, API_BASE_URL, isAdmin, user } = useAuth();

  useEffect(() => {
    fetchFlatDetails();
  }, [flatNumber]);

  const fetchFlatDetails = async () => {
    try {
      const [flatResponse, paymentsResponse, flatsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/flats/${flatNumber}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/payments/flat/${flatNumber}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/flats`, { headers: getAuthHeaders() })
      ]);

      if (flatResponse.ok && paymentsResponse.ok && flatsResponse.ok) {
        const flatData = await flatResponse.json();
        const paymentsData = await paymentsResponse.json();
        const flatsData = await flatsResponse.json();

        setFlat(flatData);
        setPayments(paymentsData);
        setAllFlats(flatsData);
      } else {
        setError('Failed to fetch flat details');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearOwner = async () => {
    if (!window.confirm(`Clear owner info for Flat ${flatNumber}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/flats/${flatNumber}/clear-owner`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        alert('Owner info cleared');
        fetchFlatDetails(); // Refresh
      } else {
        alert('Failed to clear owner info');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  // 🔍 Build graph dynamically from allFlats
  const buildGraphFromFlats = (flats) => {
    const graph = {};
    flats.forEach(flat => {
      graph[flat.flatNumber] = flat.connectedFlats || [];
    });
    return graph;
  };

  // 🔍 DFS to find group
  const findGroupForFlat = (startFlat, graph) => {
    const visited = new Set();
    const group = [];

    const dfs = (flatNo) => {
      if (visited.has(flatNo)) return;
      visited.add(flatNo);
      group.push(flatNo);
      const neighbors = graph[flatNo] || [];
      neighbors.forEach(dfs);
    };

    dfs(startFlat);
    return group;
  };

  const flatGraph = useMemo(() => buildGraphFromFlats(allFlats), [allFlats]);
  const groupFlats = useMemo(() => findGroupForFlat(flatNumber, flatGraph), [flatNumber, flatGraph]);
  const connectedFlats = useMemo(() => groupFlats.filter(f => f !== flatNumber), [groupFlats]);

  const hasPaidThisMonth = (flatNum) => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    return payments.some(p => p.flatNumber === flatNum && p.month === month && p.year === year);
  };

  const getGroupStats = () => {
    let paid = 0;
    for (const f of groupFlats) {
      if (hasPaidThisMonth(f)) paid++;
    }
    return {
      total: groupFlats.length,
      paid,
      due: groupFlats.length - paid,
    };
  };

  const groupStats = getGroupStats();
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading flat details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Flat Not Found</h2>
            <Link to="/" className="text-blue-600 hover:text-blue-800">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mr-4 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Flat Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 sm:mb-6 md:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Flat {flatNumber}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">{flat.ownerName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">{flat.contact}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                to="/add-payment"
                state={{ flatNumber }}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Payment</span>
              </Link>

              {isAdmin() && (
                <button
                  onClick={handleClearOwner}
                  className="bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Clear Owner Info</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Payment History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Payment History</h2>
                <p className="text-sm sm:text-base text-gray-600">Total Paid: ₹{totalPaid.toLocaleString()}</p>
              </div>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500">Month</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden sm:table-cell">Year</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500">Amount</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden md:table-cell">Paid On</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500">Mode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-800">
                            {p.month}
                            <span className="sm:hidden text-gray-500 block">{p.year}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{p.year}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-800">₹{p.amount}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{new Date(p.paidOn).toLocaleDateString()}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {p.paymentMode}
                            </span>
                            <div className="md:hidden text-xs text-gray-500 mt-1">
                              {new Date(p.paidOn).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment history found</p>
                  <Link to="/add-payment" state={{ flatNumber }} className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Add First Payment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {isAdmin() && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Group Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600">Total Flats in Group</span>
                    <span className="text-sm sm:text-base font-semibold text-gray-800">{groupStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600">Paid This Month</span>
                    <span className="text-sm sm:text-base font-semibold text-green-600">{groupStats.paid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600">Pending Dues</span>
                    <span className="text-sm sm:text-base font-semibold text-red-600">{groupStats.due}</span>
                  </div>
                </div>

                {connectedFlats.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">Connected Flats</h4>
                    <div className="flex flex-wrap gap-2">
                      {connectedFlats.map(f => (
                        <Link
                          key={f}
                          to={`/flat/${f}`}
                          className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm hover:bg-blue-200 transition-colors"
                        >
                          {f}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatDetails;
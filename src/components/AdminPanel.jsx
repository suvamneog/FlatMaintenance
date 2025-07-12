import React, { useState, useEffect } from 'react';
import { Users, Shield, ToggleLeft, ToggleRight, Plus, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  
  const { getAuthHeaders, API_BASE_URL } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
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
      setLoading(false);
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

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(user => 
          user._id === userId ? data.user : user
        ));
      } else {
        setError('Failed to update user status');
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
        fetchUsers(); // Refresh users list
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-full p-3">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-gray-600">Manage users and system settings</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
  <Link
    to="/admin/add-flat"
    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
  >
    <Plus className="w-5 h-5" />
    <span>Add Flat</span>
  </Link>

 
</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          </div>
          
          <div className="overflow-x-auto">
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
                {users.map((user) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
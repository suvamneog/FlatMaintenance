import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminAddFlat = () => {
  const [flatNumber, setFlatNumber] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, API_BASE_URL } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/flats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ flatNumber })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ 
          text: `Flat ${flatNumber} added successfully!`, 
          type: 'success' 
        });
        setFlatNumber('');
      } else {
        setMessage({ 
          text: data.message || 'Error adding flat', 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ 
        text: 'Network error. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-4 sm:mb-6">
          <Link 
            to="/admin" 
            className="mr-3 sm:mr-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Add New Flat</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-blue-50 p-4 sm:p-6 border-b border-blue-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Register New Flat</h2>
                <p className="text-xs sm:text-sm text-gray-600">Add a new flat to the system</p>
              </div>
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`px-4 sm:px-6 pt-3 sm:pt-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="flatNumber" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Flat Number
                </label>
                <input
                  id="flatNumber"
                  type="text"
                  placeholder="e.g., A101, B203, etc."
                  value={flatNumber}
                  onChange={(e) => {
                    setFlatNumber(e.target.value);
                    setMessage({ text: '', type: '' });
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Enter the unique flat number/identifier
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !flatNumber.trim()}
                  className={`w-full flex items-center justify-center px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Add Flat
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-blue-800 mb-2">Tips for adding flats:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use a consistent numbering system (e.g., A101, A102, B201)</li>
            <li>• Avoid special characters in flat numbers</li>
            <li>• Check for duplicates before adding new flats</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminAddFlat;
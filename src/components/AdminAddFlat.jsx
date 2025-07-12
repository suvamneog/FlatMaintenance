import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminAddFlat = () => {
  const [flatNumber, setFlatNumber] = useState('');
  const [message, setMessage] = useState('');
  const { token, API_BASE_URL } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setMessage('Flat added successfully');
        setFlatNumber('');
      } else {
        setMessage(data.message || 'Error adding flat');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Flat</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Flat Number"
          value={flatNumber}
          onChange={(e) => setFlatNumber(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Flat
        </button>
      </form>
    </div>
  );
};

export default AdminAddFlat;
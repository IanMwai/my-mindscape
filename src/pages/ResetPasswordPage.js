import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch {
      setError('Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl mb-6 text-center font-bold">Reset Password</h2>
          {error && <p className="bg-red-500 text-white text-center p-3 mb-4 rounded">{error}</p>}
          {message && <p className="bg-green-500 text-white text-center p-3 mb-4 rounded">{message}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              disabled={loading}
              className="bg-highlight hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
          <div className="text-center mt-4">
            <p>Remember your password? <Link to="/login" className="font-bold text-highlight hover:text-opacity-90">Log In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
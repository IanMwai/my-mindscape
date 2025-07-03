import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-secondary-bg shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-highlight">MY-MINDSCAPE</Link>
        <div className="flex items-center">
          <Link to="/" className="text-text-dark mx-4">Home</Link>
          {currentUser && <Link to="/account" className="text-text-dark mx-4">Account</Link>}
          {currentUser && <button onClick={logout} className="bg-highlight text-white py-2 px-4 rounded">Logout</button>}
        </div>
      </nav>
    </header>
  );
};

export default Header;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import UpdatePreferencesPage from './pages/UpdatePreferencesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MoodPage from './pages/MoodPage';
import ActivityRecsPage from './pages/ActivityRecsPage';

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="bg-primary-bg min-h-screen text-text-dark">
        <Header />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={currentUser ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="/reset-password" element={currentUser ? <Navigate to="/" /> : <ResetPasswordPage />} />

            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/update-preferences" element={<PrivateRoute><UpdatePreferencesPage /></PrivateRoute>} />
            <Route path="/mood" element={<PrivateRoute><MoodPage /></PrivateRoute>} />
            <Route path="/activities" element={<PrivateRoute><ActivityRecsPage /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to={user ? "/index" : "/"}>Engineering Platform</Link>
      </div>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/create-project" className="nav-link">Create Projects</Link>
            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
          </>
        ) : (
          <span className="nav-link">Not login</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
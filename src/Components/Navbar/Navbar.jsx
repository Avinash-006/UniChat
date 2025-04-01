import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <h2 className="logo">MyDrive</h2>
      <div className="nav-links">
        <button className="nav-link" onClick={() => navigate('/mydrive')}>
          My Drive
        </button>
        <button className="nav-link" onClick={() => navigate('/groups')}>
          Groups
        </button>
        <button className="nav-link logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
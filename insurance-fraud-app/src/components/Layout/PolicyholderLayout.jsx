import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './PolicyholderLayout.css';

const PolicyholderLayout = () => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <NavLink to="/login" className="logo">
            PlutusAI
          </NavLink>
          <nav className="nav-links">
            <NavLink 
              to="/policyholder/dashboard"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/policyholder/upload"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Upload Documents
            </NavLink>
            <NavLink 
              to="/policyholder/status"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Status Tracker
            </NavLink>
          </nav>
        </div>
        <div className="header-right">
          <NavLink 
            to="/policyholder/profile"
            className="profile-button"
          >
            P
          </NavLink>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        © 2024 PlutusAI. All rights reserved.
      </footer>
    </div>
  );
};

export default PolicyholderLayout; 
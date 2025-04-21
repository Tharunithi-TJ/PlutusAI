import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './EmployeeLayout.css';

const EmployeeLayout = () => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <NavLink to="/login" className="logo">
            PlutusAI
          </NavLink>
          <nav className="nav-links">
            <NavLink 
              to="/employee/dashboard"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/employee/review-claims"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Review Claims
            </NavLink>
            <NavLink 
              to="/employee/verify-user"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Verify User
            </NavLink>
          </nav>
        </div>
        <div className="header-right">
          <NavLink 
            to="/employee/profile"
            className="profile-button"
          >
            E
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

export default EmployeeLayout; 
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './EmployeeLayout.css';

const AnalystLayout = () => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <NavLink to="/login" className="logo">
            PlutusAI
          </NavLink>
          <nav className="nav-links">
            <NavLink 
              to="/analyst/dashboard"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/analyst/employee-analysis"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Employee Analysis
            </NavLink>
            <NavLink 
              to="/analyst/linked-analytics"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Linked Analytics
            </NavLink>
            <NavLink 
              to="/analyst/advanced-analytics"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Advanced Analytics
            </NavLink>
          </nav>
        </div>
        <div className="header-right">
          <NavLink 
            to="/analyst/profile"
            className="profile-button"
          >
            A
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

export default AnalystLayout; 
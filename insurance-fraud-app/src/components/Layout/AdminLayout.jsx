import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <NavLink to="/login" className="logo">
            PlutusAI
          </NavLink>
          <nav className="nav-links">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/manage-users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/blockchain-monitor"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Blockchain Monitor
            </NavLink>
            <NavLink
              to="/admin/system-check"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              System Check
            </NavLink>
            <NavLink
              to="/admin/rl-monitor"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              RL Monitor
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Analytics
            </NavLink>
          </nav>
        </div>
        <div className="header-right">
          <NavLink to="/admin/profile" className="profile-button">
            A
          </NavLink>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">© 2024 PlutusAI. All rights reserved.</footer>
    </div>
  );
};

export default AdminLayout;

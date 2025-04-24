import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import PolicyholderLayout from './components/Layout/PolicyholderLayout';
import EmployeeLayout from './components/Layout/EmployeeLayout';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UploadDocuments from './components/Upload/UploadDocuments';
import StatusTracker from './components/StatusTracker/StatusTracker';
import ReviewClaims from './components/ReviewClaims/ReviewClaims';
import VerifyUser from './components/VerifyUser/VerifyUser';
import ManageUsers from './components/ManageUsers/ManageUsers';
import SystemCheck from './components/SystemCheck/SystemCheck';
import MyProfile from './components/MyProfile/MyProfile';
import BlockchainMonitor from './components/BlockchainMonitor/BlockchainMonitor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Policyholder routes */}
          <Route path="/policyholder" element={<PolicyholderLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadDocuments />} />
            <Route path="status" element={<StatusTracker />} />
            <Route path="profile" element={<MyProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Employee routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="review-claims" element={<ReviewClaims />} />
            <Route path="verify-user" element={<VerifyUser />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="linked-analytics" element={<LinkedAnalytics />} />
            <Route path="profile" element={<MyProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="blockchain-monitor" element={<BlockchainMonitor />} />
            <Route path="system-check" element={<SystemCheck />} />
            <Route path="profile" element={<MyProfile />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import './ManageUsers.css';

const ManageUsers = () => {
  const users = [
    {
      id: 'JD',
      name: 'Tharunithi TJ',
      email: 'tharunithitj@gmail.com',
      role: 'employee',
      status: 'Active',
      lastLogin: '2024-03-15'
    },
    {
      id: 'JS',
      name: 'Sundaresh Karthic G',
      email: 'sundareshkarthic@gmail.com',
      role: 'policyholder',
      status: 'Active',
      lastLogin: '2024-03-14'
    },
    {
      id: 'AU',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'Active',
      lastLogin: '2024-03-16'
    }
  ];

  const handleStatusChange = (userId, newStatus) => {
    console.log(`Changing status for user ${userId} to ${newStatus}`);
  };

  const handleEdit = (userId) => {
    console.log(`Editing user ${userId}`);
  };

  return (
    <div className="manage-users">
      <div className="header-section">
        <h1>Manage Users</h1>
        <button className="add-user-button">Add User</button>
      </div>

      <div className="users-section">
        <h2>All Users</h2>
        <p className="section-description">A list of all users in the system</p>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-cell">
                    <div className="user-avatar">{user.id}</div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(user.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers; 
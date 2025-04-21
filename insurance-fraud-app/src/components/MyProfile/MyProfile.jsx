import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './MyProfile.css';

const MyProfile = () => {
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    occupation: '',
    insuranceId: '',
    joinDate: '',
    profileImage: 'https://via.placeholder.com/150',
    role: '',
    department: '',
    employeeId: '',
    adminLevel: '',
    permissions: []
  });

  useEffect(() => {
    // Determine user type from URL
    if (location.pathname.includes('/policyholder')) {
      setUserType('policyholder');
      setProfileData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'policyholder@demo.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1990-01-01',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        occupation: 'Software Engineer',
        insuranceId: 'INS-2024-001',
        joinDate: '2024-01-15',
        profileImage: 'https://via.placeholder.com/150'
      });
    } else if (location.pathname.includes('/employee')) {
      setUserType('employee');
      setProfileData({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'employee@demo.com',
        phone: '+1 (555) 987-6543',
        dateOfBirth: '1985-05-15',
        address: {
          street: '456 Bank Street',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States'
        },
        employeeId: 'EMP-2024-001',
        department: 'Claims Processing',
        role: 'Claims Analyst',
        joinDate: '2023-06-01',
        profileImage: 'https://via.placeholder.com/150'
      });
    } else if (location.pathname.includes('/admin')) {
      setUserType('admin');
      setProfileData({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@demo.com',
        phone: '+1 (555) 789-0123',
        dateOfBirth: '1980-12-31',
        address: {
          street: '789 Admin Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States'
        },
        employeeId: 'ADM-2024-001',
        department: 'Administration',
        role: 'System Administrator',
        adminLevel: 'Super Admin',
        permissions: ['User Management', 'System Configuration', 'Audit Logs', 'Security Settings'],
        joinDate: '2023-01-01',
        profileImage: 'https://via.placeholder.com/150'
      });
    }
  }, [location]);

  const handleInputChange = (e, field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: e.target.value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    console.log('Profile updated:', profileData);
    setIsEditing(false);
  };

  const renderAdditionalFields = () => {
    switch (userType) {
      case 'policyholder':
        return (
          <>
            <div className="form-group">
              <label>Insurance ID</label>
              <input
                type="text"
                value={profileData.insuranceId}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <input
                type="text"
                value={profileData.occupation}
                onChange={(e) => handleInputChange(e, 'occupation')}
                disabled={!isEditing}
              />
            </div>
          </>
        );
      case 'employee':
        return (
          <>
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                value={profileData.employeeId}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={profileData.department}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={profileData.role}
                disabled={true}
              />
            </div>
          </>
        );
      case 'admin':
        return (
          <>
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                value={profileData.employeeId}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={profileData.department}
                disabled={true}
              />
            </div>
            <div className="form-group">
              <label>Admin Level</label>
              <input
                type="text"
                value={profileData.adminLevel}
                disabled={true}
              />
            </div>
            <div className="form-group full-width">
              <label>Permissions</label>
              <div className="permissions-list">
                {profileData.permissions?.map((permission, index) => (
                  <span key={index} className="permission-badge">{permission}</span>
                ))}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-profile">
      <div className="profile-header">
        <div className="profile-image-container">
          <img src={profileData.profileImage} alt="Profile" className="profile-image" />
          {isEditing && (
            <button className="change-photo-btn">
              Change Photo
            </button>
          )}
        </div>
        <div className="profile-title">
          <h1>My Profile</h1>
          <p className="user-type">{userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
        </div>
        <button 
          className={`edit-button ${isEditing ? 'save' : ''}`}
          onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleInputChange(e, 'firstName')}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleInputChange(e, 'lastName')}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange(e, 'email')}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange(e, 'phone')}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => handleInputChange(e, 'dateOfBirth')}
              disabled={!isEditing}
            />
          </div>
          {renderAdditionalFields()}
        </div>

        <div className="address-section">
          <h2>Address Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                value={profileData.address.street}
                onChange={(e) => handleInputChange(e, 'address.street')}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={profileData.address.city}
                onChange={(e) => handleInputChange(e, 'address.city')}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={profileData.address.state}
                onChange={(e) => handleInputChange(e, 'address.state')}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                value={profileData.address.zipCode}
                onChange={(e) => handleInputChange(e, 'address.zipCode')}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={profileData.address.country}
                onChange={(e) => handleInputChange(e, 'address.country')}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="account-info">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{new Date(profileData.joinDate).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type</span>
              <span className="info-value">{userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyProfile; 
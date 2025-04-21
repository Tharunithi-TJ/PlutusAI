import React from 'react';
import './VerifyUser.css';

const VerifyUser = () => {
  const userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, ST 12345'
  };

  const documents = [
    {
      type: 'ID Proof',
      filename: 'drivers_license.pdf',
      status: 'Pending'
    },
    {
      type: 'Address Proof',
      filename: 'utility_bill.pdf',
      status: 'Pending'
    },
    {
      type: 'Income Proof',
      filename: 'bank_statement.pdf',
      status: 'Pending'
    }
  ];

  const handleVerify = (docType) => {
    console.log('Verifying document:', docType);
  };

  const handleReject = (docType) => {
    console.log('Rejecting document:', docType);
  };

  const handleViewDocument = (filename) => {
    console.log('Viewing document:', filename);
  };

  return (
    <div className="verify-user">
      <h1>Verify User</h1>

      <div className="verify-container">
        <div className="user-info-section">
          <h2>User Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <div className="info-value">{userInfo.name}</div>
            </div>
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{userInfo.email}</div>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <div className="info-value">{userInfo.phone}</div>
            </div>
            <div className="info-item">
              <label>Address</label>
              <div className="info-value">{userInfo.address}</div>
            </div>
          </div>
        </div>

        <div className="document-verification-section">
          <h2>Document Verification</h2>
          <div className="documents-list">
            {documents.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-info">
                  <h3>{doc.type}</h3>
                  <p className="filename">{doc.filename}</p>
                  <span className={`status-badge status-${doc.status.toLowerCase()}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="document-actions">
                  <button
                    className="action-button verify"
                    onClick={() => handleVerify(doc.type)}
                  >
                    ✓ Verify
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => handleReject(doc.type)}
                  >
                    × Reject
                  </button>
                  <button
                    className="action-button view"
                    onClick={() => handleViewDocument(doc.filename)}
                  >
                    👁 View Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyUser; 
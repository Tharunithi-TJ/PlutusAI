import React, { useState, useEffect } from 'react';
import './BlockchainMonitor.css';

const BlockchainMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Implement blockchain transaction monitoring logic
    const fetchTransactions = async () => {
      try {
        // Simulated API call
        const mockTransactions = [
          {
            id: 1,
            hash: '0x123...abc',
            timestamp: new Date().toISOString(),
            status: 'completed',
            type: 'claim_verification'
          },
          {
            id: 2,
            hash: '0x456...def',
            timestamp: new Date().toISOString(),
            status: 'pending',
            type: 'document_verification'
          }
        ];
        
        setTransactions(mockTransactions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch blockchain transactions');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div className="blockchain-monitor loading">Loading transactions...</div>;
  if (error) return <div className="blockchain-monitor error">{error}</div>;

  return (
    <div className="blockchain-monitor">
      <h2>Blockchain Transaction Monitor</h2>
      <div className="transactions-list">
        {transactions.map((tx) => (
          <div key={tx.id} className="transaction-card">
            <div className="transaction-header">
              <span className="transaction-hash">{tx.hash}</span>
              <span className={`transaction-status ${tx.status}`}>{tx.status}</span>
            </div>
            <div className="transaction-details">
              <p>Type: {tx.type}</p>
              <p>Timestamp: {new Date(tx.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainMonitor; 
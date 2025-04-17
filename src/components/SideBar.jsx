import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/SideBar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>
      
      <div className="sidebar-content">
        <h3 className="sidebar-title">Credit Card Services</h3>
        
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard" className="sidebar-link">
              <span className="sidebar-icon">💳</span>
              My Cards
            </Link>
          </li>
          <li>
            <Link to="/apply-card" className="sidebar-link">
              <span className="sidebar-icon">📝</span>
              Apply for New Card
            </Link>
          </li>
          <li>
            <Link to="/transactions" className="sidebar-link">
              <span className="sidebar-icon">📊</span>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/rewards" className="sidebar-link">
              <span className="sidebar-icon">🏆</span>
              Rewards & Benefits
            </Link>
          </li>
          <li>
            <Link to="/payments" className="sidebar-link">
              <span className="sidebar-icon">💲</span>
              Make Payment
            </Link>
          </li>
          <li>
            <Link to="/settings" className="sidebar-link">
              <span className="sidebar-icon">⚙️</span>
              Account Settings
            </Link>
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <p>Need help? <Link to="/support">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
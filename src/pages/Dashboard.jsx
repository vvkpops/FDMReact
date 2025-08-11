import React, { useState } from 'react';
import NotamDashboard from '../components/NotamDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('main');
  const currentDate = new Date().toISOString().split('T')[0];
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Flight Data Management</h1>
        <div className="user-info">
          <span className="date-display">{currentDate}</span>
          <span className="user-display">User: vvkpops</span>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === 'main' ? 'active' : ''}>
            <button onClick={() => setActiveTab('main')}>Main Dashboard</button>
          </li>
          <li className={activeTab === 'notam' ? 'active' : ''}>
            <button onClick={() => setActiveTab('notam')}>NOTAM Dashboard</button>
          </li>
          <li className={activeTab === 'flights' ? 'active' : ''}>
            <button onClick={() => setActiveTab('flights')}>Flight Data</button>
          </li>
          <li className={activeTab === 'reports' ? 'active' : ''}>
            <button onClick={() => setActiveTab('reports')}>Reports</button>
          </li>
          <li className={activeTab === 'settings' ? 'active' : ''}>
            <button onClick={() => setActiveTab('settings')}>Settings</button>
          </li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {activeTab === 'main' && (
          <div className="main-dashboard-content">
            <h2>Flight Data Management Overview</h2>
            <div className="dashboard-widgets">
              {/* Existing dashboard widgets from FDMReact */}
              <div className="widget">
                <h3>Active Flights</h3>
                <div className="widget-content">
                  <p className="widget-value">24</p>
                  <p className="widget-trend positive">+3 from yesterday</p>
                </div>
              </div>
              
              <div className="widget">
                <h3>Active NOTAMs</h3>
                <div className="widget-content">
                  <p className="widget-value">156</p>
                  <p className="widget-trend negative">+12 from yesterday</p>
                </div>
              </div>
              
              <div className="widget">
                <h3>Weather Alerts</h3>
                <div className="widget-content">
                  <p className="widget-value">7</p>
                  <p className="widget-trend">No change</p>
                </div>
              </div>
              
              <div className="widget">
                <h3>System Status</h3>
                <div className="widget-content">
                  <p className="widget-value status-ok">All Systems Operational</p>
                </div>
              </div>
            </div>
            
            {/* Quick access to NOTAM dashboard */}
            <div className="quick-access-panel">
              <h3>Quick NOTAM Access</h3>
              <button 
                className="quick-access-button"
                onClick={() => setActiveTab('notam')}
              >
                Open NOTAM Dashboard
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'notam' && (
          <div className="notam-dashboard-wrapper">
            <NotamDashboard />
          </div>
        )}
        
        {activeTab === 'flights' && (
          <div className="flights-content">
            <h2>Flight Data</h2>
            <p>Flight data visualization and management interface goes here.</p>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="reports-content">
            <h2>Reports</h2>
            <p>Reports and analytics interface goes here.</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-content">
            <h2>Settings</h2>
            <p>Application settings interface goes here.</p>
          </div>
        )}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 Flight Data Management System | Last updated: 2025-08-11 00:57:07 UTC</p>
      </footer>
    </div>
  );
};

export default Dashboard;

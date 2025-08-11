import React from 'react';
import './NotamDetail.css';

const NotamDetail = ({ notam, loading, onClose }) => {
  if (loading) {
    return (
      <div className="notam-detail-overlay">
        <div className="notam-detail">
          <div className="notam-detail-header">
            <h3>Loading NOTAM Details...</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!notam) {
    return null;
  }
  
  return (
    <div className="notam-detail-overlay">
      <div className="notam-detail">
        <div className="notam-detail-header">
          <h3>NOTAM {notam.id}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="notam-detail-content">
          <div className="notam-detail-section">
            <h4>Basic Information</h4>
            <table className="notam-detail-table">
              <tbody>
                <tr>
                  <th>Location:</th>
                  <td>{notam.location}</td>
                  <th>Type:</th>
                  <td>
                    <span className={`notam-type type-${notam.type}`}>
                      {notam.type}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Effective Date:</th>
                  <td>{new Date(notam.effectiveDate).toLocaleString()}</td>
                  <th>Expiry Date:</th>
                  <td>
                    {notam.expiryDate 
                      ? new Date(notam.expiryDate).toLocaleString() 
                      : 'Permanent'}
                  </td>
                </tr>
                <tr>
                  <th>Issued By:</th>
                  <td>{notam.issuedBy || 'N/A'}</td>
                  <th>Status:</th>
                  <td>
                    <span className={`status-indicator ${
                      new Date(notam.effectiveDate) <= new Date() && 
                      (!notam.expiryDate || new Date(notam.expiryDate) >= new Date()) 
                        ? 'active' 
                        : 'inactive'
                    }`}>
                      {new Date(notam.effectiveDate) <= new Date() && 
                       (!notam.expiryDate || new Date(notam.expiryDate) >= new Date()) 
                        ? 'Active' 
                        : 'Inactive'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="notam-detail-section">
            <h4>Description</h4>
            <div className="notam-description-full">
              {notam.description}
            </div>
          </div>
          
          {notam.altitude && (
            <div className="notam-detail-section">
              <h4>Altitude Information</h4>
              <p>{notam.altitude}</p>
            </div>
          )}
          
          {notam.radius && (
            <div className="notam-detail-section">
              <h4>Area</h4>
              <p>Radius: {notam.radius}</p>
            </div>
          )}
          
          {notam.remarks && (
            <div className="notam-detail-section">
              <h4>Remarks</h4>
              <p>{notam.remarks}</p>
            </div>
          )}
        </div>
        
        <div className="notam-detail-footer">
          <button className="export-button" onClick={() => exportNotam(notam)}>
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to export NOTAM details as PDF
const exportNotam = (notam) => {
  console.log(`Exporting NOTAM ${notam.id} as PDF`);
  // This would be connected to your PDF generation functionality
  alert(`Exporting NOTAM ${notam.id} details. The PDF will download shortly.`);
};

export default NotamDetail;

import React from 'react';
import './NotamList.css';

const NotamList = ({ notams, loading, selectedId, onSelectNotam }) => {
  if (loading) {
    return (
      <div className="notam-list">
        <h3>NOTAM List</h3>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading NOTAMs...</p>
        </div>
      </div>
    );
  }
  
  if (!notams || notams.length === 0) {
    return (
      <div className="notam-list">
        <h3>NOTAM List</h3>
        <p className="no-results">No NOTAMs found matching your criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="notam-list">
      <h3>NOTAM List ({notams.length} found)</h3>
      <div className="notam-table-container">
        <table className="notam-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Type</th>
              <th>Effective</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {notams.map(notam => (
              <tr 
                key={notam.id} 
                className={selectedId === notam.id ? 'selected' : ''}
                onClick={() => onSelectNotam(notam)}
              >
                <td>{notam.id}</td>
                <td>{notam.location}</td>
                <td>
                  <span className={`notam-type type-${notam.type}`}>
                    {notam.type}
                  </span>
                </td>
                <td>{new Date(notam.effectiveDate).toLocaleDateString()}</td>
                <td className="notam-description">
                  {notam.description.length > 100 
                    ? `${notam.description.substring(0, 100)}...` 
                    : notam.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotamList;

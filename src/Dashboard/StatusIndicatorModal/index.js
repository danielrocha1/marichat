import React, { useState } from 'react';
import './index.css'; // Importa o arquivo CSS para estilos





const StatusIndicator = ({userData, setUserData}) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [status, setStatus] = useState(userData.data.status);

  const handleStatusChange = async (newStatus) => {
    
    setSubmenuOpen(false);
  
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/updateUserStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostid:userData.data.hostid, status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log("Sucesso:",data)

      setUserData((prevState) => ({
        ...prevState,
        data: {
          ...prevState.data,
          status: newStatus,
        },
      }));

      setSubmenuOpen(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="status-container">
      {/* Status Indicator */}
      <div className="status-indicator" onClick={() => setSubmenuOpen(!submenuOpen)}>
        <span className={`status-bubble ${userData.data.status === 'Online' ? 'status-online' : 
                                          userData.data.status === 'Ocupado' ? 'status-ocupado' : 
                                          'status-offline'}`}></span>
        <span>{userData.data.status}</span>
        <span className="arrow">{submenuOpen ? '▲' : '▼'}</span>
      </div>

      {/* Status Options (Submenu) */}
      {submenuOpen && (
        <div className="submenu">
          <div
            className={`submenu-option ${userData.data.status === 'Online' ? 'selected' : ''}`}
            onClick={() => handleStatusChange('Online')}
          >
            <span className="status-bubble status-online"></span>
            <span>Online</span>
            
          </div>
          <div
            className={`submenu-option ${userData.data.status === 'Ocupado' ? 'selected' : ''}`}
            onClick={() => handleStatusChange('Ocupado')}
          >
            <span className="status-bubble status-ocupado"></span>
            <span>Ocupado</span>
            
          </div>
          <div
            className={`submenu-option ${userData.data.status === 'Offline' ? 'selected' : ''}`}
            onClick={() => handleStatusChange('Offline')}
          >
            <span className="status-bubble status-offline"></span>
            <span>Offline</span>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
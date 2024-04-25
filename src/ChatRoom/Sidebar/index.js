import './index.css';
import React, { useState } from 'react';



const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  
  
    return (
      <div className={`sidebarChat ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <div onClick={toggleSidebar} className="toggle-btn">
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
        </div>
        <div className="user-info">
          <p>Email: </p>
        </div>
        
      </div>
    );
  };

  export default Sidebar;
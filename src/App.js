import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import EnterRoom from './EnterRoom';
import LoginSign from './Login';
import OfflineChat from './OfflineChat';
import ChatContext from './ChatContext';


function App() {
  const [userData, setUserData] = useState({});


  return (
    <Router>
            <ChatContext.Provider value={{ userData, setUserData }}>
              <div className="app">
               
                  <Routes>
                    <Route path="/" element={<EnterRoom />} />
                    <Route path="/login" element={<LoginSign />} />
                    <Route path="/chatroom" element={<ChatRoom />} />
                    <Route path="/offline" element={<OfflineChat />} />
                    {/* Add more routes here if needed */}
                  </Routes>
              </div>
            </ChatContext.Provider>
    </Router>
  );
}

export default App;

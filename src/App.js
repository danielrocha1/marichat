import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatRoom from './ChatRoom';

import Dashboard from './Dashboard';

import LoginSign from './Login';
import OfflineChat from './OfflineChat';
import ChatContext from './ChatContext';


function App() {
  const [userData, setUserData] = useState({});
  const [chats, setChats] = useState([]);


  return (
    <Router>
            <ChatContext.Provider value={{ userData, setUserData, chats, setChats }}>
              <div className="">
               
                  <Routes>
                    <Route path="/" element={<LoginSign />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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

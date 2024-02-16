// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import EnterRoom from './EnterRoom';
import ChatContext from './ChatContext';

function App() {
  const [userData, setUserData] = useState({});

  return (
    <Router>
      <div>
        <ChatContext.Provider value={{ userData, setUserData}}>
          <Routes>
            <Route path="/" element={<EnterRoom />} />
            <Route path="/chatroom" element={<ChatRoom />} />
          </Routes>
        </ChatContext.Provider>
      </div>
    </Router>
  );
}

export default App;

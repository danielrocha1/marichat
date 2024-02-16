import React, { useState, useContext } from 'react';
import TextInput from './TextBox';
import Toolbar from './ToolBar';

import './index.css';




function ChatBox() {
  

  return (
    <div className="chatBox">
      <div className="chatScreen">
      </div>
      <div className="menu">
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
      <Toolbar />
      <TextInput />
    </div>
  );
}

export default ChatBox;

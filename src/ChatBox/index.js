import React, {useState} from 'react';
import TextInput from './TextBox';
import Toolbar from './ToolBar';

import './index.css';




function ChatBox() {
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState('');

  return (
    <div className="chatBox">
      <div className="chatScreen">
      </div>
      <div className="menu">
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
      <Toolbar setShowEmoji={setShowEmoji} setText={setText} />
      <TextInput showEmoji={showEmoji} text={text} setText={setText} />
    </div>
    
  );
}

export default ChatBox;

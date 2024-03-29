import React, { useState, useRef, useEffect } from 'react';
import TextInput from './TextBox';
import Toolbar from './ToolBar';
import './index.css';

function ChatBox({ messages, theme, color, setColors }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };

    scrollToBottom();

    return () => {};
  }, [messages]);

  return (
    <div className="chatBox" style={{ backgroundColor: theme.chatBox, borderColor: theme.border }}>
      <div className="chatScreen" style={{ borderColor: theme.border }} ref={chatContainerRef}>
        {messages}
      </div>
      <Toolbar setShowEmoji={setShowEmoji} setText={setText} theme={theme} setColors={setColors} />
      <TextInput showEmoji={showEmoji} text={text} setText={setText} />
    </div>
  );
}

export default ChatBox;

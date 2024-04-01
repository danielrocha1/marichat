import React, { useState, useRef, useEffect } from 'react';
import TextInput from './TextBox';
import Toolbar from './ToolBar';
import './index.css';

function ChatBox({ chat, messages, theme, color, setColors, roomname}) {
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
      <Toolbar chat={chat} roomname={roomname} setShowEmoji={setShowEmoji} setText={setText} theme={theme} setColors={setColors} />
      <TextInput  chat={chat} showEmoji={showEmoji} text={text} setText={setText} />
    </div>
  );
}

export default ChatBox;

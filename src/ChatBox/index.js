import React, { useState, useRef, useEffect } from 'react';
import TextInput from './TextBox';
import Toolbar from './ToolBar';
import ColorSelector from './ToolBar/ColorSelector';
import './index.css';

function ChatBox({ messages, theme, color,  setColors }) {
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
    <div className="chatBox" style={{ backgroundColor: theme.chatBox, borderColor:theme.border }}>
      <div className="chatScreen" style={{ borderColor:theme.border }} ref={chatContainerRef}>
        {messages}
      </div>
      {/* <div className="menu" style={{ borderColor:theme.border, backgroundColor:theme.chatBox }}>
      <div className="line" style={{ backgroundColor:theme.border }}/>
      <div className="line" style={{ backgroundColor:theme.border }}/>
      <div className="line" style={{ backgroundColor:theme.border }}/> 

      </div>*/}
      <Toolbar setShowEmoji={setShowEmoji} setText={setText} theme={theme} setColors={setColors} />
      <TextInput showEmoji={showEmoji} text={text} setText={setText} />
      {/* Adicione um evento de clique ao botão */}
      {/* <button onClick={handleButtonClick}>Change Color to Blue</button> */}
    </div>
  );
}

export default ChatBox;

<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
=======
import React, {useState} from 'react';
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
import TextInput from './TextBox';
import Toolbar from './ToolBar';
import ColorSelector from './ToolBar/ColorSelector';
import './index.css';

<<<<<<< HEAD
function ChatBox({ messages, theme, color,  setColors }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState('');
  
=======



function ChatBox() {
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState('');
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)

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
<<<<<<< HEAD
      {/* <div className="menu" style={{ borderColor:theme.border, backgroundColor:theme.chatBox }}>
      <div className="line" style={{ backgroundColor:theme.border }}/>
      <div className="line" style={{ backgroundColor:theme.border }}/>
      <div className="line" style={{ backgroundColor:theme.border }}/> 

      </div>*/}
      <Toolbar setShowEmoji={setShowEmoji} setText={setText} theme={theme} setColors={setColors} />
      <TextInput showEmoji={showEmoji} text={text} setText={setText} />

=======
      <div className="menu">
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
      <Toolbar setShowEmoji={setShowEmoji} setText={setText} />
      <TextInput showEmoji={showEmoji} text={text} setText={setText} />
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
    </div>
    
  );
}

export default ChatBox;

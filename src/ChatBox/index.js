
import React, { useState } from 'react';
import TextInput from './TextBox';
import Toolbar from './ToolBar';
import './index.css'


function SenderMessage(props) {
  return (
    <div className="senderMessage">
      {props.message}
    </div>
  );
}

// Componente de mensagem do receptor (receiver)
function ReceiverMessage(props) {
  return (
    <div className="receiverMessage">
      {props.message}
    </div>
  );
}

function ChatBox() {

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [guestMessages, setGuestMessages] = useState([]);



    return (

      <div className="chatBox">
      <div className="chatScreen">
        {guestMessages.map((content, index) => (
          <ReceiverMessage key={index} message={content} /> // Alterado de msg.content para content
        ))}
        {messages.map((msg, index) => (
          <SenderMessage key={index} message={msg} />
        ))}
      </div>
      <div className="menu">
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
      <Toolbar />
      <TextInput setMessages={setMessages} setGuestMessages={setGuestMessages} />
    </div>
  );
}

export default ChatBox;

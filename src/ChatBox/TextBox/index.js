import React, { useState, useContext } from 'react';
import './index.css';
import ChatContext from '../../ChatContext';

function TextInput({ showEmoji, chat, text, setText }) {
  const [isTyping, setIsTyping] = useState(false);
  const { userData } = useContext(ChatContext);

  const sendTypingStatus = (isTyping) => {
    const socket = new WebSocket('wss://marichat-go-xtcz.onrender.com/websocket');

    socket.onopen = () => {
      const userTyping = {
        type: "typing",
        user: userData.data.username,
        hostid: userData.data.hostid,
        isTyping: isTyping
      };

      socket.send(JSON.stringify(userTyping));
    };

    socket.onerror = (error) => {
      console.error('Error:', error.message);
    };
  };

  const handleChange = (event) => {
    
    const inputValue = event.target.value;
    
    console.log(showEmoji)
    setText(inputValue);
    setIsTyping(true);
    sendTypingStatus(inputValue.trim() !== '');
  };

  const handleSendMessage = async () => {
    if (text.trim() === '') {
      return; // Don't send if text is empty or only whitespace
    }

    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "receiver",
          username: userData.data.username,
          hostid: userData.data.hostid,
          roomname: chat.roomname,
          chatid: chat.chatid,
          message: text
        }),
      });

      if (!response.ok) {
        throw new Error('Error sending data');
      }

      setText(''); // Clear text after sending
      setIsTyping(false); // Update typing status
      sendTypingStatus(false);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' ) {
      const inputValue = event.target.value;
    
      console.log(showEmoji)
      setText(inputValue);
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Digite aqui..."
        style={{ marginRight: '10px', fontSize: "24px", backgroundColor: "#b8cad4" }}
      />
      <div
        className="submitButton"
        onClick={() => {
          console.log(text)

     
            handleSendMessage();
          
        }}
      >
        <span role="img" aria-label="Enviar">➡️</span>
      </div>
    </div>
  );
}

export default TextInput;
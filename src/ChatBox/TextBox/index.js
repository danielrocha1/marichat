import React, { useState, useContext } from 'react';
import './index.css';
import ChatContext from '../../ChatContext';

function TextInput({ showEmoji, text, setText }) {
  const [isTyping, setIsTyping] = useState(false);
  const { userData } = useContext(ChatContext);

  const sendTypingStatus = (isTyping) => {
    const socket = new WebSocket('wss://marichat-go.onrender.com/websocket');

    socket.onopen = () => {
      const userTyping = {
        type: "typing",
        user: userData.user,
        isTyping: isTyping
      };

      socket.send(JSON.stringify(userTyping));
    };

    socket.onerror = (error) => {
      console.error('Erro:', error.message);
    };
  };

  const handleChange = (event) => {
    const inputValue = event.target.value.trim();
    setText(inputValue);

    if (inputValue !== '') {
      setIsTyping(true);
      sendTypingStatus(true);
    } else {
      setIsTyping(false);
      sendTypingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch('https://marichat-go.onrender.com/sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "type": "receiver",
          "username": userData.user,
          "roomname": userData.chatroomName,
          "message": text
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

      sendTypingStatus(false);
      setText('');
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
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
      <div className="submitButton" onClick={handleSendMessage}>
        <span role="img" aria-label="Enviar">➡️</span>
      </div>
    </div>
  );
}

export default TextInput;

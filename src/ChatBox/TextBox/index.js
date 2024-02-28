import React, { useState, useContext } from 'react';
import './index.css';
import ChatContext from '../../ChatContext'; // Importe o contexto

function TextInput({showEmoji, text, setText}) {
  
  const [isTyping, setIsTyping] = useState(false); // Estado local para controlar se o usuário está digitando
  const { userData } = useContext(ChatContext);

  const sendTypingStatus = (isTyping) => {
    const socket = new WebSocket('ws://localhost:8080/websocket');

    socket.onopen = () => {
      console.log('Conexão WebSocket aberta');
      
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
    const inputValue = event.target.value; // Remove espaços em branco do início e do fim
  
    setText(inputValue); // Atualiza o estado local com o valor do input
  
    // Verifica se há algum texto no input
    if (inputValue.trim() !== '') {
      setIsTyping(true); // Atualiza o estado local para indicar que o usuário está digitando
      sendTypingStatus(true); // Envia o status de digitação para o servidor
    } else {
      setIsTyping(false); // Atualiza o estado local para indicar que o usuário parou de digitar
      sendTypingStatus(false); // Envia o status de digitação para o servidor
    }
  };
  

  const handleSendMessage = async (e) => {
    // Quando a mensagem é enviada, o usuário não está mais digitando
    
    // e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/sender', {
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
        style={{ marginRight: '10px', fontSize:"24px" }}
      />
      <div className="submitButton" onClick={handleSendMessage}>
        <span role="img" aria-label="Enviar">➡️</span>
      </div>
    </div>
  );
}

export default TextInput;

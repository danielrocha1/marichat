import React, { useState, useContext } from 'react';
import './index.css';
import ChatContext from '../../ChatContext'; // Importe o contexto

import { render } from 'react-dom';

let isTyping = false;



const sendTypingStatus = (userData, isTyping) => {
  const socket = new WebSocket('ws://localhost:8080/websocket');

  // Verifica se a conexão WebSocket está aberta
  socket.onopen = () => {
    console.log('Conexão WebSocket aberta');
  
    // Envia os dados do usuário que está digitando e o status de digitação para o servidor via WebSocket
    const userTyping = {
      type:"typing",
      user: userData.user, // Substitua "Nome do usuário aqui" pelo nome do usuário atual
      isTyping: isTyping
    };   
    // Envie os dados para o servidor via WebSocket
    socket.send(JSON.stringify(userTyping));
  };

  socket.onerror = (error) => {
    console.error('Erro:', error.message);
  };
};



function TextInput() {

  const [text, setText] = useState('');
  const { userData} = useContext(ChatContext);

  const handleChange = (event) => {



    setText(event.target.value);
    if (event.target.value.trim() !== '') {
      console.log(event.target.value)
      if (!isTyping) {
    
        // Se o usuário começou a digitar, atualize o status e envie os dados para o servidor
        isTyping = true;
        sendTypingStatus(userData, true); // Passando userData como argumento
      }
    } else {
      if (isTyping) {
        // Se a caixa de entrada foi limpa e o usuário estava digitando anteriormente,
        // atualize o status e envie os dados para o servidor
        isTyping = false;
        sendTypingStatus(userData, false); // Passando userData como argumento
      }
    }
  };


  const handleSendMessage = async (e) => {
    
    e.preventDefault();

  console.log(userData, 'textinput')
    try {
      const response = await fetch('http://localhost:8080/sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "type":"receiver",
          "username": userData.user,
          "roomname": userData.chatroomName,
          "message": text // Enviar a mensagem digitada pelo usuário
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
      // sendTypingStatus(userData, false)
      setText('');
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        // onKeyDown={handleKeyDown}
        placeholder="Digite aqui..."
        style={{ marginRight: '10px' }}
      />
      <div className="submitButton" onClick={handleSendMessage}>
        <span role="img" aria-label="Enviar">➡️</span>
      </div>
    </div>
  );
}

export default TextInput;

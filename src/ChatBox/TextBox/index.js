import React, { useState, useContext } from 'react';
import './index.css';
import ChatContext from '../../ChatContext'; // Importe o contexto
<<<<<<< HEAD

function TextInput({showEmoji, text, setText}) {
  
  const [isTyping, setIsTyping] = useState(false); // Estado local para controlar se o usuário está digitando
  const { userData } = useContext(ChatContext);

  const sendTypingStatus = (isTyping) => {
    const socket = new WebSocket('wss://localhost:8080/websocket');

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
=======

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
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)

    try {
      const response = await fetch('https://marichat-go.onrender.com/sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
<<<<<<< HEAD
          "type": "receiver",
=======
          "type":"receiver",
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
          "username": userData.user,
          "roomname": userData.chatroomName,
          "message": text
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
<<<<<<< HEAD
      
      sendTypingStatus(false);
=======
      // sendTypingStatus(userData, false)
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
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
<<<<<<< HEAD
        onKeyDown={handleKeyPress}
=======
        // onKeyDown={handleKeyDown}
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
        placeholder="Digite aqui..."
        style={{ marginRight: '10px', fontSize:"24px", backgroundColor:"#b8cad4"}}
      />
      <div className="submitButton" onClick={handleSendMessage}>
        <span role="img" aria-label="Enviar">➡️</span>
      </div>
    </div>
  );
}

export default TextInput;

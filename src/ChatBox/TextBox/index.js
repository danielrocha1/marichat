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
    
<<<<<<< HEAD
    e.preventDefault();
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
    // e.preventDefault();
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)

    try {
      const response = await fetch('https://marichat-go.onrender.com/sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
<<<<<<< HEAD
<<<<<<< HEAD
          "type": "receiver",
=======
          "type":"receiver",
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
          "type": "receiver",
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
          "username": userData.user,
          "roomname": userData.chatroomName,
          "message": text
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
      
      sendTypingStatus(false);
=======
      // sendTypingStatus(userData, false)
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
      sendTypingStatus(false);
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
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
<<<<<<< HEAD
        onKeyDown={handleKeyPress}
=======
        // onKeyDown={handleKeyDown}
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
        onKeyDown={handleKeyPress}
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
        placeholder="Digite aqui..."
<<<<<<< HEAD
<<<<<<< HEAD
        style={{ marginRight: '10px', fontSize:"24px", backgroundColor:"#b8cad4"}}
=======
        style={{ marginRight: '10px', fontSize:"24px" }}
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
        style={{ marginRight: '10px', fontSize:"24px", backgroundColor:"#b8cad4"}}
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
      />
      <div className="submitButton" onClick={handleSendMessage}>
        <span role="img" aria-label="Enviar">➡️</span>
      </div>
    </div>
  );
}

export default TextInput;

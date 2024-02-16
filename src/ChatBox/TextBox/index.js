import React, { useState, useContext } from 'react';
import './index.css';
import ChatContext from '../../ChatContext'; // Importe o contexto
import SenderMessage from '../../ChatBox'
import { render } from 'react-dom';


function TextInput() {
  const { userData} = useContext(ChatContext);
  

  

  const [text, setText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
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
          "username": userData.user,
          "roomname": userData.chatroomName,
          "message": text // Enviar a mensagem digitada pelo usuário
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

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

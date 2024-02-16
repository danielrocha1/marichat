import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import  ChatContext  from '../ChatContext'; // Importe o contexto aqui
import './index.css'; // Arquivo de estilo CSS para centralizar o formulário

function EnterRoom() {
  const navigate = useNavigate();
  const { setUserData } = useContext(ChatContext); // Use o hook useContext para acessar os dados do contexto

  const [user, setUser] = useState('');
  const [chatroomName, setChatroomName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "username": user, "roomname": chatroomName }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

      // Se o envio do formulário for bem-sucedido, atualize o contexto e navegue para a página ChatRoom com os parâmetros na URL
      setUserData({ user, chatroomName });
      navigate(`/chatroom`);
    } catch (error) {
      console.error('Erro:', error.message);
      alert('Erro ao entrar na sala de chat. Por favor, tente novamente mais tarde.');
    }
  };

  return (
    <div className="centered-form">
      <form onSubmit={handleSubmit} className="form">
        <h2>Chat Form</h2>
        <div className="form-group">
          <label htmlFor="user">Usuário:</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="chatroomName">Nome da Sala de Chat:</label>
          <input
            type="text"
            id="chatroomName"
            value={chatroomName}
            onChange={(e) => setChatroomName(e.target.value)}
          />
        </div>
        <button type="submit">Entrar na Sala de Chat</button>
      </form>
    </div>
  );
}

export default EnterRoom;

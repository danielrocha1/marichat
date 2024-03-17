import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContext from '../ChatContext'; // Importe o contexto aqui
import './index.css'; // Arquivo de estilo CSS para centralizar o formulário

function EnterRoom() {
  const navigate = useNavigate();
  const { setUserData } = useContext(ChatContext); // Use o hook useContext para acessar os dados do contexto

  const [user, setUser] = useState('');
  const [chatroomName, setChatroomName] = useState('');
  const [fakeHostId, setFakeHostId] = useState('');
  const [fakeChatId, setFakeChatId] = useState('');

  useEffect(() => {
    const { v4: uuidv4 } = require('uuid');
    setFakeHostId(uuidv4());
    setFakeChatId(uuidv4());
  }, []); // Executar apenas uma vez após a montagem do componente

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://marichat-go.onrender.com/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, roomname: chatroomName, hostid: fakeHostId, chatid: fakeChatId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

      // Se o envio do formulário for bem-sucedido, atualize o contexto e navegue para a página ChatRoom com os parâmetros na URL
      setUserData({ user, chatroomName, fakeChatId, fakeHostId });
      console.log(fakeChatId)
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

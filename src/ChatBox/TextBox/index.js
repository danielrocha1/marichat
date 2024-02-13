import React, { useState, useEffect } from 'react';
import './index.css';

function TextInput({ setMessages }) {
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSendMessage = () => {
    if (text.trim() !== '') {
      const newMessage = { sender: 'usuário', content: text };
      console.log('aquin', newMessage)
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setText('');
    }
  };

  useEffect(() => {
    // Cria a conexão WebSocket quando o componente é montado
    const newSocket = new WebSocket('ws://localhost:8080/ws');
    setSocket(newSocket);

    // Define os handlers de eventos para a conexão WebSocket
    newSocket.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
    };

    newSocket.onmessage = (event) => {
      // Quando uma mensagem é recebida do backend, atualiza o estado das mensagens
      const newMessage = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    newSocket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };

    // Fecha a conexão WebSocket quando o componente é desmontado
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [setMessages]); // Apenas recria a conexão quando setMessages muda

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

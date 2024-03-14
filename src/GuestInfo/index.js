import React, { useState, useEffect } from 'react';
import './index.css';
import avataaars from '../HostInfo/avataaars.png'
import guestAvatar from './guestAvatar.png'; // Importe a imagem corretamente

const GuestInfo = (props) => {
  const [isTyping, setIsTyping] = useState(false);

  // Atualiza o estado de "isTyping" quando a propriedade muda
  useEffect(() => {
    setIsTyping(props.isTyping);
  }, [props.isTyping]);

  const kickUser = async (username, roomname) => {
    try {
      const response = await fetch('https://marichat-go.onrender.com/kickUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          "username": username,
          "roomname": roomname,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <div className="box" style={{ flex: "row", display: "flex", marginTop: "5px" }}>
      <div className="kick" onClick={() => kickUser(props.name, props.roomname)}>
        <p style={{ marginTop: "35px" }}>X</p>
      </div>
      <div className={`guestBox ${isTyping ? 'typing' : ''}`}>
        <img src={props.name === "Daniel" ? avataaars : guestAvatar} className="guestPhoto" alt="logo" />
        <div className="">
          <p className="guestName">{props.name}</p>
          {isTyping && <p className="typingIndicator">Digitando...</p>}
        </div>
      </div>
    </div>
  );
}

export default GuestInfo;

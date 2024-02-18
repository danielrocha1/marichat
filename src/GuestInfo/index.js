import React, { useState, useEffect } from 'react';
import './index.css';
import guestAvatar from './guestAvatar.png'; // Importe a imagem corretamente
import avataaars from '../HostInfo/avataaars.png'; // Importe a imagem corretamente

<<<<<<< HEAD
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
      

        {props.name === "Daniel" ? <img src={avataaars} className="guestPhoto" alt="logo" /> : <img src={guestAvatar} className="guestPhoto" alt="logo" />} 

        <div className="">
          <p className="guestName">{props.name}</p>
          {isTyping && <p className="typingIndicator">Digitando...</p>}
        </div>
      </div>
    </div>
=======
import logo from  './guestAvatar.png';
import React, { useState, } from 'react';
import './index.css'

function GuestInfo(props) {
  const [isTyping, setIsTyping] = useState(false);

  // Função para atualizar o estado de "Digitando..."
  function handleTyping(isTyping) {
      setIsTyping(isTyping);
  }

  // Renderização condicional da mensagem de "Digitando..."
  const typingIndicator = isTyping ? <p>Digitando...</p> : null;

  return (
      <div className="guestBox">
          <img src={logo} className="guestPhoto" alt="logo" />
          <div id={props.id} className="guestInfoContainer">
              <p className="guestName">{props.name}</p>
              {typingIndicator}
          </div>
      </div>
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
  );
}

export default GuestInfo;


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
  );
}

export default GuestInfo;

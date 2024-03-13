import logo from './guestAvatar.png';
import React, { useState, useEffect } from 'react';
import './index.css';

function GuestInfo(props) {
    const [isTyping, setIsTyping] = useState(false);

  // Atualiza o estado de "isTyping" quando a propriedade muda
  useEffect(() => {
    setIsTyping(props.isTyping);
  }, [props.isTyping]);

  return (
    <div className={`guestBox ${isTyping ? 'typing' : ''}`}>
      <img src={logo} className="guestPhoto" alt="logo" />
      <div className="guestInfoContainer">
        <p className="guestName">{props.name}</p>
        {isTyping && <p className="typingIndicator">Digitando...</p>}
      </div>
    </div>
  );
}

export default GuestInfo;
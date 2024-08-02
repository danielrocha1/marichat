import React, { useState, useEffect } from 'react';
import './index.css';
import avataaars from '../Dashboard/ImageHost/av.png'
import guestAvatar from './guestAvatar.png'; // Importe a imagem corretamente

const GuestInfo = (props) => {
  const [isTyping, setIsTyping] = useState(false);

  // Atualiza o estado de "isTyping" quando a propriedade muda
  useEffect(() => {
    setIsTyping(props.isTyping);
  }, [props.isTyping]);

  const kickUser = async () => {
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/kickuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username":props.name,
          "hostid": props.hostid,
          "chatid": props.chatid,
          "roomname": props.roomname,
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
    <div  id={`${props.hostid}`} className="box" style={{ flex: "row", display: "flex", marginTop: "5px" }}>
  {props.name === "Daniel" ? ' ' : <div className="kick" onClick={() => kickUser()}>
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
      }
      <div className={`guestBox ${isTyping ? 'typing' : ''}`}>
        <img src={props.photo} className="guestPhoto" alt="logo" />
        <div className="">
          <p className="guestName">{props.name}</p>
          {isTyping && <p className="typingIndicator">Digitando...</p>}
        </div>
      </div>
    </div>
  );
}

export default GuestInfo;

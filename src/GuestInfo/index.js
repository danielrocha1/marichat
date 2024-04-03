import React, { useState, useEffect } from 'react';
import './index.css';
import avataaars from '../HostInfo/avataaars.png'
import guestAvatar from './guestAvatar.png'; // Importe a imagem corretamente

const GuestInfo = (props) => {
  const [isTyping, setIsTyping] = useState(false);

  // Atualiza o estado de "isTyping" quando a propriedade muda
  useEffect(() => {
    setIsTyping(props.isTyping);
    console.log(props.isTyping, "DIGITANDO 45", props.hostid)


  }, [props.isTyping]);

  const kickUser = async (name, chatid, hostid, roomname) => {
    try {
      const response = await fetch('https://marichat-go.onrender.com/kickuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username":name,
          "hostid": hostid,
          "chatid": chatid,
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
    <div  id={`${props.hostid}`} className="box" style={{ flex: "row", display: "flex", marginTop: "5px" }}>
  {props.name === "Daniel" ? ' ' : <div className="kick" onClick={() => kickUser(props.name, props.hostid, props.chatid, props.roomname)}>
        <p style={{ marginTop: "35px" }}>X</p>
      </div> }
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

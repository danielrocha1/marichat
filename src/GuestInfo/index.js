<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import logo from './guestAvatar.png';
import React, { useState, useEffect } from 'react';
import './index.css';
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
import React, { useState, useEffect } from 'react';
import './index.css';
import guestAvatar from './guestAvatar.png'; // Importe a imagem corretamente
import avataaars from '../HostInfo/avataaars.png'; // Importe a imagem corretamente
>>>>>>> 4d3b67d (commit)

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
<<<<<<< HEAD
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
    </div>
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
  );
}

export default GuestInfo;

import React, { useState, useEffect } from 'react';
import './index.css';


const Modal = ({ isOpen, onExpel, onAddFriend }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <div className="modal-options">
          <button className="modal-option" onClick={onExpel}>Expulsar do Chat</button>
          <button className="modal-option" onClick={onAddFriend}>Adicionar como Amigo</button>
        </div>
      </div>
    </div>
  );
};

const GuestInfo = (props) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(!isModalOpen);

  const handleExpel = () => {
    // Lógica para expulsar do chat
    console.log('Expulsar do chat');
    setIsModalOpen(false)
  };

  const handleAddFriend = () => {
    // Lógica para adicionar como amigo
    console.log('Adicionar como amigo');
    setIsModalOpen(false)
  };


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
    <div id={`${props.hostid}`} className="box">
      {props.name === "Daniel" ? ' ' : (
        <div className="kick" onClick={openModal}>
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
      )}
      <div className={`guestBox ${isTyping ? 'typing' : ''}`}>
        <img src={props.photo} className="guestPhoto" alt="logo" />
        <div className="guestInfo">
          <p className="guestName">{props.name}</p>
          {isTyping && <p className="typingIndicator">Digitando...</p>}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onExpel={handleExpel}
        onAddFriend={handleAddFriend}
      />
    </div>
  );
}

export default GuestInfo;

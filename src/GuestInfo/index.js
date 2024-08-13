import React, {useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ChatContext from '../ChatContext';
import './index.css';

const Modal = ({ isOpen, onExpel, onAddFriend, showExpelOption,  }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <div className="modal-options">
          {showExpelOption ? (
            <button className="modal-option" onClick={onExpel}>
              Expulsar do Chat
            </button>
          ) : '' }
          <button className="modal-option" onClick={onAddFriend}>
            Adicionar como Amigo
          </button>
        </div>
      </div>
    </div>
  );
};

const GuestInfo = (props) => {
  const { userData } = useContext(ChatContext);
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chat = Object.fromEntries(searchParams.entries());



  const openModal = () => {
    setIsModalOpen(!isModalOpen);
  }

  const handleExpel = async () => {
    await kickUser();
    setIsModalOpen(false);
  };

  const handleAddFriend = async () => {
    await sendFriendRequest();
    setIsModalOpen(false);
  };

  useEffect(() => {
    setIsTyping(props.isTyping);
  }, [props.isTyping]);

  const sendFriendRequest = async () => {
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/friendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostid1: userData.data.hostid,
          hostid2: props.hostid,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const kickUser = async () => {
    console.log(props.chat.hostid, userData.data.hostid)
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/kickuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: props.name,
          hostid: props.hostid,
          chatid: props.chatid,
          roomname: chat.chatname,
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
      
        <div className="kick" onClick={openModal}>
          <div className="Bar1"></div>
          <div className="Bar2"></div>
          <div className="Bar3"></div>
        </div>
      
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
        showExpelOption={props.chatHostid === userData.data.hostid}
      />
    </div>
  );
};

export default GuestInfo;

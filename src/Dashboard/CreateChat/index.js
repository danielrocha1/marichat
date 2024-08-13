import React, { useState, useContext } from 'react';
import './index.css'; // Arquivo de estilo CSS para centralizar o formulário
import { useNavigate } from 'react-router-dom';
import ChatContext from '../../ChatContext';

function CreateChat() {
  const { userData, setUserData, setChats} = useContext(ChatContext);
  
  const [chatRoom, setChatroomName] = useState('');
  const [chatid, setChatID] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  
 
  
  const handleSubmit = async (e) => {

    e.preventDefault();
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/createchat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: userData.data.username,
            hostid: userData.data.hostid,
            chatname: chatRoom,
            private: isPrivate, 
            
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }
        setChats(prevChats => [
          ...prevChats,
          {
            username: userData.data.username,
            hostid: userData.data.hostid,
            chatname: chatRoom,
            private: isPrivate
          }
        ]);

        setModalIsOpen(false);
      } catch (error) {
        console.error('Erro:', error.message);
      }
      
  };

  
    return (
      <div>
        {/* Botão para abrir o modal */}
        <button onClick={() => setModalIsOpen(!modalIsOpen)} className="violet-button">
          Criar Sala
        </button>
  
        {/* Modal */}
        {modalIsOpen && (
          <div className="modal">
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="form">
                <h2>Criar Sala</h2>
                <div className="form-group">
                  <label htmlFor="chatroomName">Nome da Sala:</label>
                  <input
                    type="text"
                    id="chatroomName"
                    value={chatRoom}
                    onChange={(e) => setChatroomName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Sala:</label>
                  <label htmlFor="public">
                    <input
                      type="radio"
                      id="public"
                      checked={!isPrivate}
                      onChange={() => setIsPrivate(false)}
                    />
                    Público
                  </label>
                  <label htmlFor="private">
                    <input
                      type="radio"
                      id="private"
                      checked={isPrivate}
                      onChange={() => setIsPrivate(true)}
                    />
                    Privado
                  </label>
                </div>
                <button type="submit">Criar Sala de Chat</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

export default CreateChat;

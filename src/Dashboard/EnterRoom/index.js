import React, { useState } from 'react';
import './index.css'; // Arquivo de estilo CSS para centralizar o formulário
import { useNavigate } from 'react-router-dom';


function EnterRoom(user, setUserData) {
  const [chatroomName, setChatroomName] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log(user, chatroomName)

    setUserData(prevData => ({
      ...prevData,
      ["roomname"]: chatroomName
    }));
    console.log(user, chatroomName)

    // const queryString = new URLSearchParams(user).toString();  
    e.preventDefault();
      try {
        const response = await fetch('https://marichat-go.onrender.com/enterroom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: user.data.username,
            hostid: user.data.hostid,
            chatid: chatroomName 
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }

        // navigate(`/chatroom?${queryString}`);
      } catch (error) {
        console.error('Erro:', error.message);
      }
  };

  return (
    <div>
      {/* Botão para abrir o modal */}
      <button onClick={() => setModalIsOpen(!modalIsOpen)} className="violet-button">Entrar na Sala</button>

      {/* Modal */}
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <form onSubmit={handleSubmit} className="form">
              <h2>Entrar na sala</h2>
              <div className="form-group">
                <label htmlFor="user">ID da Sala:</label>
                <input
                  type="text"
                  id="chatroomName"
                  value={chatroomName}
                  onChange={(e) => setChatroomName(e.target.value)}
                />
              </div>
              <button type="submit">Entrar na Sala de Chat</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterRoom;

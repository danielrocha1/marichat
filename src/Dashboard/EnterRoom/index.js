import React, { useState } from 'react';
import './index.css'; // Arquivo de estilo CSS para centralizar o formulário

function EnterRoom() {
  const [chatroomName, setChatroomName] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aqui vai o seu código de submissão do formulário
  };

  return (
    <div>
      {/* Botão para abrir o modal */}
      <button onClick={() => setModalIsOpen(!modalIsOpen)} className="violet-button">Entrar na Sala</button>

      {/* Modal */}
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalIsOpen(false)}>
              &times;
            </span>
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

import React, { useState } from 'react';
import "./index.css"

// Componentes
const Sidebar = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
 
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div>
          <div onClick={toggleSidebar} className="toggle-btn">
              <div className="bar1"></div>
              <div className="bar2"></div>
              <div className="bar3"></div>
          </div>
        </div>
      <div className="user-info">
        <img src={user.photo} alt="User" />
        <p>{user.username}</p>
        <p>{user.email}</p>
      </div>
    </div>
      
  );
};

const TopHeader = ({ handleLogout }) => {
  return (
    <div className="top-header">
      <div onClick={handleLogout}>Logout</div>
    </div>
  );
};

const MeuChat = () => {
  return <div>Conteúdo do Meu Chat</div>;
};

const ChatPublico = () => {
  return <div>Conteúdo do Chat Público</div>;
};

function ChatTable({ chats }) {
  return (
    <div className="">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome do Chat</th>
              <th>Chat ID</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat, index) => ( // Adicionei o parâmetro de índice para a função handleAction
              <tr key={chat.id}>
                <td>{chat.name}</td>
                <td>{chat.id}</td>
                <td>
                  <button onClick={() => handleAction(index)} className="blue-button">Entrar</button>
                  <button onClick={() => handleAction(index)} className="red-button">Remover</button>

                  {/* Adicione mais botões ou links conforme necessário */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// App
const Dashboard = () => {
  

  

  // Placeholder user object
  const user = {
    photo: 'user-photo-url',
    username: 'username',
    email: 'user@example.com'
  };

  const chats = [
    {
      name: 'chat1',
      id: 'user@example.comuser@example.comuser@example',
    }
  ];


  const handleLogout = () => {
    // Aqui você implementará a lógica real para logout
    console.log("Logout");
  };

  const handleEnterRoom = () => {
    // Aqui você implementará a lógica para entrar na sala
    console.log("Entrar na Sala");
  };

  const handleCreateChat = () => {
    // Aqui você implementará a lógica para criar um chat
    console.log("Criar Chat");
  };

  return (
    <div>
      <TopHeader
        handleLogout={handleLogout}
        handleEnterRoom={handleEnterRoom}
        handleCreateChat={handleCreateChat}
      />   
    <div className="app">
      <Sidebar user={user} />

      <div className="container">
      <div className="createChat">
        <button onClick={() => handleAction(index)} className="violet-button">Criar Chat</button>
      </div>

        
      <div className="">
        <ChatTable chats={chats}/>
      </div>

        </div>
       </div>
     
    </div>
  );
};

export default Dashboard;
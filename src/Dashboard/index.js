import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import './index.css';

// Componentes
const Sidebar = ({ user}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = ({chats}) => {
    console.log(user.data.hostid)
 
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
        <p>{user.data.fullname}</p>
        <p>{user.data.email}</p>
        <p>{user.data.birthdate}</p>
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

const ChatTable = ({ userData, setChats, chats }) => {
  

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('https://marichat-go.onrender.com/chatrooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "hostid": userData.data.hostid }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }

        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchChats();
  }, []);

  const handleChat = () => {
    console.log("Entrar no chat");
  };
  
  const removeChat = () => {
    console.log("Remover chat");
  };

  
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
            {chats.map((chat, index) => (
              <tr key={chat.id}>
                <td>{chat.chatname}</td>
                <td>{chat.chatid}</td>
                <td>
                  <button onClick={handleChat} className="blue-button">Entrar</button>
                  <button onClick={removeChat} className="red-button">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// App
const Dashboard = () => {
  const { userData, setChats } = useContext(ChatContext);

  const handleLogout = () => {
    console.log("Logout");
  };

  return (
    <div>
      <TopHeader handleLogout={handleLogout} />
      <div className="app">
        <Sidebar user={userData} />
        <div className="container">
          <div className="createChat">
            <button onClick={() => console.log("criar chat")} className="violet-button">Criar Chat</button>
          </div>
          <div className="">
            <ChatTable userData={userData} setChats={setChats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
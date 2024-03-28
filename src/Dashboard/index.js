import React, { useState, useContext } from 'react';
import ChatContext from '../ChatContext';
import './index.css';

// Componentes
const Sidebar = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log(user)
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

const ChatTable = ({ userData, setChats }) => {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://marichat-go.onrender.com/chatrooms', {
          method: 'GET',
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

    fetchUsers();
  });

  const HandleChat = () => {
    console.log(chat)
    
  };
  
  const RemoveChat = () => {
    console.log(user)
    
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
                <td>{chat.name}</td>
                <td>{chat.id}</td>
                <td>
                  <button onClick={HandleChat} className="blue-button">Entrar</button>
                  <button onClick={RemoveChat} className="red-button">Remover</button>
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
const { userData, setUserData } = useContext(ChatContext);



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

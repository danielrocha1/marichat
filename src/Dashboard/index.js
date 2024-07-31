import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContext from '../ChatContext';

import ImageHost from './ImageHost';
import EnterRoom from '../Dashboard/EnterRoom';
import CreateChat from '../Dashboard/CreateChat';

import './index.css';

// Componentes
const Sidebar = ({ user, chats }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const AvatarButton = () => {
    const handleClick = () => {
      window.location.href = 'https://avatarmaker.com/';
    };
  
    return (
      <button className="avatar-button" onClick={handleClick}>
        Criar seu Avatar
      </button>
    );
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
      <ImageHost user={user}/>
        <p style={{marginTop:"30px"}}>Nome: {user.data.fullname}</p>
        <p>Email: {user.data.email}</p>
        <p>Data de Nascimento: {user.data.birthdate ? new Date(user.data.birthdate).toLocaleDateString('pt-BR') : 'Data de nascimento não disponível'}</p>
        <div >
          <AvatarButton/>
        </div>
      </div>
    </div>
  );
};
const simulateWebSocket = (callback) => {
  // Simula a chegada de uma nova mensagem a cada 5 segundos
  setInterval(() => {
    callback({ text: 'Nova mensagem recebida!' });
  }, 5000);
};

const TopHeader = ({ handleLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Simula a recepção de mensagens pelo WebSocket
  useEffect(() => {
    simulateWebSocket((newMessage) => {
      setNotifications(prev => [...prev, newMessage]);
    });

    // Cleanup function to clear intervals when component unmounts
    return () => {
      clearInterval(simulateWebSocket);
    };
  }, []);

  // Função para exibir o modal
  const handleClickMessages = () => {
    setShowModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Opcional: limpar notificações ao fechar o modal
     setNotifications([]);
  };

  return (
    <div className="top-header">
      <div onClick={handleClickMessages} className="">
      <p className="messages">
  Messages {
    notifications.length > 0 && (
      <b className="notification-count">({notifications.length})</b>
    )
  }
</p>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={handleCloseModal}>&times;</span>
              <h2>Notifications</h2>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="notification">
                    {notification.text}
                    <button style={{backgroundColor:"green", color:"white", margin:"5px"}}>Aceitar</button>
                    <button style={{backgroundColor:"red", color:"white", margin:"5px"}}>Recusar</button>
                  </div>
                ))
              ) : (
                <p>No new notifications</p>
              )}
            </div>
          </div>
        )}

     
      </div> 
      
      <div style={{marginRight:"10px"}}>
          <p onClick={handleLogout} className="">Logout</p>
      </div> 
    </div>
  );
};



const ChatTable = ({ userData, setUserData, setChats, chats }) => {
const navigate = useNavigate();
  useEffect(() => {
    
    const fetchChats = async () => {
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/chatrooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hostid: userData.data.hostid }), // remove as aspas desnecessárias
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
  }, [chats]); // Adiciona userData.data.hostid como dependência para recarregar os chats quando mudar

  const handleChat = (chat) => {
    const queryString = new URLSearchParams(chat).toString();  
    const addUserToChat = async () => {
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/enterroom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            chatname: chat.chatname,
            username: userData.data.username,
            hostid: userData.data.hostid,
            chatid: chat.chatid 
          }),
          
        });

        if (!response.ok) {
         
          throw new Error('Erro ao enviar os dados');
        }
            
        navigate(`/chatroom?${queryString}`);
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    addUserToChat();
  };

  const removeChat = async (chat, userData) => { 
    console.log("hostid:", userData.data.hostid,"chatid:", chat.chatid )
      try {
        
        const response = await fetch('https://marichat-go-xtcz.onrender.com/deletechat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({             
            hostid: userData.data.hostid,
            chatid: chat.chatid 
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
          {chats && chats.map((chat) => (
            <tr key={chat.chatid}>
              <td>{chat.chatname}</td>
              <td>{chat.chatid}</td>
              <td>
                <button onClick={() => handleChat(chat)} className="blue-button">Entrar</button>
                <button onClick={() => removeChat(chat,userData)} className="red-button">Remover</button>
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
  const { userData, setUserData, setChats, chats } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate(`/`)
  };


  return (
    <div>
      <TopHeader handleLogout={handleLogout} />
      <div className="app">
        <Sidebar user={userData} chats={chats} />
        <div className="container">
        <div className="containerchat">
          <div className="createChat">
            <EnterRoom />
          </div>
          <div className="createChat">
            <CreateChat setChats={setChats} />
            
          </div>
        </div>
          <div className="">
            <ChatTable userData={userData} setChats={setChats} chats={chats} /> {/* passa um array vazio para chats */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'; // Certifique-se de que você tem esse arquivo de estilos

// Simulação de contexto para o exemplo
const ChatContext = React.createContext();

const simulateWebSocket = (callback) => {
  setInterval(() => {
    callback({ 
      text: 'Você recebeu um convite para um chat!', 
      chatid: 'fe41361c-054e-4a0a-91bd-b0201953ce00',
    });
  }, 5000);
};

// Sidebar Component
const Sidebar = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const AvatarButton = () => {
    const handleClick = () => {
      window.open('https://avatarmaker.com/', '_blank');
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
        {/* Substitua com o componente ImageHost conforme necessário */}
        <p style={{marginTop:"30px"}}>Nome: {user.data.fullname}</p>
        <p>Email: {user.data.email}</p>
        <p>Data de Nascimento: {user.data.birthdate ? new Date(user.data.birthdate).toLocaleDateString('pt-BR') : 'Data de nascimento não disponível'}</p>
        <div>
          <AvatarButton />
        </div>
      </div>
    </div>
  );
};

// TopHeader Component
const TopHeader = ({ userData, handleLogout, navigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const intervalId = simulateWebSocket((newMessage) => {
      setNotifications(prev => [...prev, newMessage]);
    });

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleClickMessages = () => {
    setShowModal(!showModal);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNotifications([]);
  };

  const handleRejectNotification = (index) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };

  const handleAcceptNotification = async (index) => {
    const queryString = new URLSearchParams({ chatid: notifications[index].chatid }).toString();  
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: userData.data.username,
          hostid: userData.data.hostid,
          chatid: notifications[index].chatid 
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

  return (
    <div className="top-header">
      <div onClick={handleClickMessages}>
        <p className="messages">
          Messages {
            notifications.length > 0 && (
              <b className="notification-count">{notifications.length}</b>
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
                    <button
                      style={{ backgroundColor: "green", color: "white", margin: "5px" }}
                      onClick={() => handleAcceptNotification(index)}
                    >
                      Aceitar
                    </button>
                    <button
                      style={{ backgroundColor: "red", color: "white", margin: "5px" }}
                      onClick={() => handleRejectNotification(index)}
                    >
                      Recusar
                    </button>
                  </div>
                ))
              ) : (
                <p>No new notifications</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginRight: "10px" }}>
        <p onClick={handleLogout}>Logout</p>
      </div>
    </div>
  );
};

// ChatTable Component
const ChatTable = ({ userData, setChats, chats }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/chatrooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hostid: userData.data.hostid }),
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
  }, [userData.data.hostid]);

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

  const removeChat = async (chat) => { 
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
                <button onClick={() => removeChat(chat)} className="red-button">Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { userData, setUserData, setChats, chats } = useContext(ChatContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate(`/`);
  };

  return (
    <div>
      <TopHeader handleLogout={handleLogout} userData={userData} navigate={navigate}/>
      <div className="app">
        <Sidebar user={userData} />
        <div className="container">
          <div className="containerchat">
            {/* Substitua com os componentes EnterRoom e CreateChat conforme necessário */}
          </div>
          <div>
            <ChatTable userData={userData} setChats={setChats} chats={chats} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Exemplo de implementação de App.js
const App = () => {
  const [userData, setUserData] = useState({});
  const [chats, setChats] = useState([]);

  return (
    <ChatContext.Provider value={{ userData, setUserData, setChats, chats }}>
      <Dashboard />
    </ChatContext.Provider>
  );
};

export default App;

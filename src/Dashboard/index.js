import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContext from '../ChatContext';

import ImageHost from './ImageHost';
import EnterRoom from '../Dashboard/EnterRoom';
import CreateChat from '../Dashboard/CreateChat';

import './index.css';

// Componentes
const Sidebar = ({ user }) => {
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
    callback({ 
      text: 'Você recebeu um convite para um chat!', 
      chatid:'fe41361c-054e-4a0a-91bd-b0201953ce00',
       });
  }, 5000);
};

const TopHeader = ({userData, handleLogout, navigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
      
    const fetchRequest = async () => {
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/selectfriendRequest', {
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
        setFriendRequests(data);
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchRequest();
  }, [friendRequests]); // Adiciona userData.data.hostid como dependência para recarregar os chats quando mudar





  // Simula a recepção de mensagens pelo WebSocket
  useEffect(() => {
    // Função para configurar o WebSocket
    const setupWebSocket = () => {
      // Substitua 'ws://example.com/socket' pela URL do seu WebSocket
      const socket = new WebSocket('wss://marichat-go-xtcz.onrender.com/websocket');

      // Função para lidar com novas mensagens do WebSocket
      socket.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        setNotifications(prev => [...prev, newMessage]);
      };

      // Função para lidar com erros
      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      // Função para lidar quando a conexão WebSocket é fechada
      socket.onclose = () => {
        console.log('WebSocket closed');
      };

      return socket;
    };

    // Configura o WebSocket
    const socket = setupWebSocket();

    // Cleanup function to close WebSocket when component unmounts
    return () => {
      socket.close();
    };
  }, []);


  // Função para exibir o modal
  const handleNotificationModal = () => {
    setShowNotificationModal(!showNotificationModal);
    setNotifications([]);
  };

  const handleFriendModal = () => {
    setShowFriendModal(!showFriendModal);
    setNotifications([]);
  };


  const handleRejectNotification = (index) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, i) => i !== index)
    );
  };
  const handleDeclineRequest = async ( index, userData ) => {
   

    const queryString = new URLSearchParams({
          chatid: notifications[index].chatid,
          username: userData.data.username,
          hostid: userData.data.hostid
      }).toString();
    
     
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

  const handleAcceptRequest = async ( index, userData ) => {
   

    const queryString = new URLSearchParams({
          chatid: notifications[index].chatid,
          username: userData.data.username,
          hostid: userData.data.hostid
      }).toString();
    
     
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





  const handleAcceptNotification = async ( index, userData ) => {
  const queryString = new URLSearchParams({
        chatid: notifications[index].chatid,
        username: userData.data.username,
        hostid: userData.data.hostid
    }).toString();
  
   
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
      <div onClick={handleNotificationModal} >
        <p  className="messages">
          Messages {
            notifications.length > 0 && (
              <b className="notification-count">{notifications.length}</b>
            )
          }
        </p>        
        {showNotificationModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => {handleNotificationModal()}}>&times;</span>
              <h2>Notifications</h2>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="notification">
                    {notification.text}
                    <button
                      style={{ backgroundColor: "green", color: "white", margin: "5px" }}
                      onClick={() => handleAcceptNotification(index, userData)}
                      
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

     
      <div onClick={handleFriendModal} >
        <p  className="friend">
          FriendRequest {
            friendRequests.length > 0 && (
              <b className="notification-count">{friendRequests.length}</b>
            )
          }
        </p>
        {showFriendModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => {handleFriendModal()}}>&times;</span>
              <h2>Friend Request's</h2>
              {friendRequests.length > 0 ? (
                friendRequests.map((notification, index) => (
                  <div key={index} className="notification">
                    {notification.text}
                    <button
                      style={{ backgroundColor: "green", color: "white", margin: "5px" }}
                      onClick={() => handleAcceptRequest(index, userData)}
                      
                    >
                      Aceitar
                    </button>
                    <button
                      style={{ backgroundColor: "red", color: "white", margin: "5px" }}
                      onClick={() => handleDeclineRequest(index)}
                    >
                      Recusar
                    </button>
                  </div>
                ))
              ) : (
                <p>No new requests</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div onClick={handleLogout} style={{marginRight: "10px"}}>
        <p >Logout</p>
      </div>
    </div>
  );
}

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





const PublicChatTable = ({ userData }) => {
  const [publicChats, setPublicChats] = useState([]);
  const navigate = useNavigate();
    useEffect(() => {
      
      const fetchChats = async () => {
        try {
          const response = await fetch('https://marichat-go-xtcz.onrender.com/publicchatrooms', {
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
          setPublicChats(data);
        } catch (error) {
          console.error('Erro:', error.message);
        }
      };
  
      fetchChats();
    }, [publicChats]); // Adiciona userData.data.hostid como dependência para recarregar os chats quando mudar
  
     
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
            {publicChats && publicChats.map((chat) => (
              <tr key={chat.chatid}>
                <td>{chat.chatname}</td>
                <td>{chat.chatid}</td>
                <td>
                  <button onClick={() => handleChat(chat)} className="blue-button">Entrar</button>
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
      <TopHeader handleLogout={handleLogout} userData={userData} navigate={navigate}/>
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
         
          <div className="">
            <h1>Chats Públicos</h1>
            <PublicChatTable userData={userData} setChats={setChats} chats={chats} /> {/* passa um array vazio para chats */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContext from '../ChatContext';

import { FaUser, FaUsers, FaCommentDots, FaUserPlus, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import ImageHost from './ImageHost';
import EnterRoom from '../Dashboard/EnterRoom';
import CreateChat from '../Dashboard/CreateChat';

import './index.css';

// Componentes
const Sidebar = ({ user, setCurrentView }) => {
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
        <div onClick={toggleSidebar} className="toggle-btn" title="Abrir barra lateral">
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
        <div onClick={ () => {setCurrentView('InfoUser')}}  className="user-btn" title="Infomações de Usuário">
        <FaUser size={40} color={"white"} style={{cursor: "pointer" }} onClick={() => {}} />
        </div>
        <div onClick={ () => {setCurrentView('friends')}} className="friend-btn" title="Lista de Amigos">
        <FaUsers size={40} color={"white"} style={{cursor: "pointer" }} />
        </div>
        <div onClick={ () => {setCurrentView('chat')}}  className="chat-btn" title="Chats"> 
        <FaCommentDots size={40} color={"white"} style={{cursor: "pointer" }} onClick={() => {}} />
        </div>
      
      <div className="user-info">
      <ImageHost user={user}/>
        <p style={{marginTop:"10px"}}>Nome: {user.data.fullname}</p>
        <p>Email: {user.data.email}</p>
        <p>Data de Nascimento: {user.data.birthdate ? new Date(user.data.birthdate).toLocaleDateString('pt-BR') : 'Data de nascimento não disponível'}</p>
        <div >
          <AvatarButton/>
        </div>
        <div style={{marginTop:"10px"}}>
          <b style={{color:"#0ceb00", }}> Amigos online 05/10</b>
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

const TotalFriendList = ({ userData }) => {
  const [friends, setFriends] = useState([{photo_url:"POATO",name:"GRaNDE", status:'offline'},{photo_url:"POATO",name:"GRaNDE", status:"online"},{photo_url:"POATO",name:"GRaNDE", status:"offline"},{photo_url:"POATO",name:"GRaNDE", status:"busy"}]);
  const sortedFriends = friends?.sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;
    if (a.status === 'offline' && b.status !== 'offline') return 1;
    if (a.status !== 'offline' && b.status === 'offline') return -1;
    return 0;
  });

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/selectFriend', {
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
        setFriends(data);
      
        
        // console.log(sortedFriends)
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchFriends();
  }, [userData.data.hostid]);

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'online':
        return ' rgb(19, 160, 4)';
      case 'offline':
        return 'gray';
      default:
        return 'red';
    }
  };

  return (
    <div className="friends">
      <h5 style={{ color: "green", textAlign: "center" }}>Amigos online</h5>
      <div className="friends-list">
        {sortedFriends?.map(friend => (
          <div
            key={friend.id}
            className="friends-card"
            style={{ borderColor: getStatusBorderColor(friend.status) }}
          >
            <b style={{color: getStatusBorderColor(friend.status), }}>{friend.status}</b>
            <img src={`data:image/jpeg;base64,${friend?.photo_url}`} alt={friend.name} className="friends-photo" />
            <div className="friends-info">
              <h3 className="friends-name">{friend.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// const TotalFriendList = ({userData}) => {
//   const [friends, setFriends] = useState([]);


//   useEffect(() => {
      
//     const fetchFriends = async () => {
//       try {
//         const response = await fetch('https://marichat-go-xtcz.onrender.com/selectFriend', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ hostid: userData.data.hostid }), // remove as aspas desnecessárias
//         });

//         if (!response.ok) {
//           throw new Error('Erro ao enviar os dados');
//         }

//         const data = await response.json();

//         setFriends(data);
        
//       } catch (error) {
//         console.error('Erro:', error.message);
//       }
//     };

//     fetchFriends();
//   }, [friends]); // Adiciona userData.data.hostid como dependência para recarregar os chats quando mudar

//   return (
//     <div className="total-friends">
//       <h5 style={{color:"green", textAlign: "center" }}>Amigos online</h5>
//       <div className="total-friends-list">
//       {friends.map(friend => (
//         <div key={friend.id} className="total-friends-card">
//           <img src={`data:image/jpeg;base64,${friend?.photo_url}`} alt={friend.name} className="total-friends-photo" />
//           <div className="total-friends-info">
//             <h3 className="total-friends-name">{friend.name}</h3>
//           </div>
//         </div>
//       ))}
//       </div>
//     </div>
//   );
// };


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
        console.log(data)
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
   
      console.log(friendRequests)
  
    
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

  const handleAcceptRequest = async (index, userData) => {

    try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/acceptFriendRequest', { // Atualize a URL com o endereço correto do seu backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hostid: userData.data.hostid,
                friendid: friendRequests[index].hostid  // Assume-se que o friendid é parte das notificações
            }),
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar os dados');
        }

        // Se necessário, processe a resposta aqui
        const result = await response.json();
        console.log('Sucesso:', result);

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
      <div className="messages-header" onClick={handleNotificationModal} >
        <p  className="messages">
        <FaEnvelope size={25} title='Notificações' color={"white"} style={{cursor: "pointer" }} onClick={() => {}} /> {
            notifications.length > 0 && (
              <b className="messages-count">{notifications.length}</b>
            )
          }
        </p>        
        {showNotificationModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => {handleNotificationModal()}}>&times;</span>
              <h2>Notificações</h2>
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
                <p>Sem novas notificações</p>
              )}
            </div>
          </div>
        )}
      </div>

     
      <div onClick={handleFriendModal}>
      <p className="friend">
      <FaUserPlus size={25} title='Solicitações de amizades' color={"white"} style={{cursor: "pointer" }} onClick={() => {}} /> {
          
          friendRequests?.length > 0 && (
            <b className="notification-count">{friendRequests.length}</b>
          )
        }
      </p>
      {showFriendModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleFriendModal}>&times;</span>
            <h3>Solicitações de Amizade</h3>
            {friendRequests?.length ? (
              friendRequests.map((user, index) => {
                console.log("User:", user); // Adicione este log para verificar cada usuário
                return (
                  <div className="notification-container">
                  <div key={index} className="notification-card">
                    <div className="friend-info">
                      <img src={`data:image/jpeg;base64,${user?.photo_url}`} alt="User photo" className="friend-photo" />
                      <p className="friend-name">{user?.name}</p>
                    </div>
                    <div className="action-buttons">
                      <button
                        className="accept-button"
                        onClick={() => handleAcceptRequest(index, userData)}
                      >
                        Aceitar
                      </button>
                      <button
                        className="decline-button"
                        onClick={() => handleDeclineRequest(index)}
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
                );
              })
            ) : (
              <p>Sem novas solicitações</p>
            )}
          </div>
        </div>
      )}
    </div>
      
      <div title="Sair" style={{marginRight: "20px"}}>
      <FaSignOutAlt size={30} color={"white"} style={{cursor: "pointer", marginTop: "12px" }} onClick={handleLogout} />
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
  const [currentView, setCurrentView] = useState('chat');

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <>
            <div className="containerchat">
              <div className="createChat">
                <EnterRoom />
              </div>
              <div className="createChat">
                <CreateChat setChats={setChats} />
              </div>
            </div>
            <div>
              <ChatTable userData={userData} setChats={setChats} chats={chats} />
            </div>
            <div className="containerPublic">
              <h1>Chats Públicos</h1>
              <PublicChatTable userData={userData} setChats={setChats} chats={chats} />
            </div>
          </>
        );
      case 'friends':
        return <TotalFriendList userData={userData} />;
      case 'userInfo':
        // return <UserInfoForm userData={userData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <TopHeader handleLogout={handleLogout} userData={userData} navigate={navigate} />
      <div className="app">
        <Sidebar user={userData} chats={chats} setCurrentView={setCurrentView} />
        <div className="container">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import SenderImage from '../ChatBox/SenderImage';
import ReceiverImage from '../ChatBox/ReceiverImage';
import PDFViewer from '../ChatBox/ToolBar/UploadFile/PDFViewer';

function ReceiverMessage(props) {
  const timestamp = new Date(props.Hour);
  const hora = format(timestamp, 'HH:mm');
  return (
    <div className="receiverMessage">
      <p style={{ fontSize: '15px', textAlign: 'left', fontWeight: 'bold' }}>{props.Name}:</p>
      {props.Message}
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
    </div>
  );
}

function SenderMessage(props) {
  const timestamp = new Date();
  const hora = format(timestamp, 'HH:mm');
  return (
    <div className="senderMessage">
      {props.Message}
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
    </div>
  );
}

function ChatRoom() {
  const { userData } = useContext(ChatContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chat = Object.fromEntries(searchParams.entries());

  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [roomname, setRoomname] = useState('');
  const [messages, setMessages] = useState([]);
  const [userTypingStatus, setUserTypingStatus] = useState([]);
  const [users, setUsers] = useState([]);
  const [colors, setColors] = useState({
    chatBox: '#7d3e5d',
    background: 'linear-gradient(to bottom, #482436, #000000)',
    border: 'white',
  });

  const handleFriendModal = () => {
    setShowFriendModal(!showFriendModal);
    console.log(friendRequests);
  };

  const handleInviteRequest = async (index) => {
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/acceptFriendRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendid: friendRequests[index].hostid
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

      const result = await response.json();
      console.log('Sucesso:', result);
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  useEffect(() => {
    const fetchRequest = async () => {
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
        console.log(data);
        setFriendRequests(data);
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchRequest();
  }, [userData.data.hostid]); // Corrigido para evitar loop infinito

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://marichat-go-xtcz.onrender.com/listusers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatid: chat.chatid }),
        });

        if (!response.ok) {
          throw new Error('Erro ao obter os usuários');
        }

        const data = await response.json();
        setUsers(data.users);
        setRoomname(data.roomname);
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchUsers();

    const socket = new WebSocket('wss://marichat-go-xtcz.onrender.com/websocket');
    socket.onmessage = handleWebSocketMessage;

    return () => {
      socket.close();
    };
  }, [chat.chatid]); // Corrigido para garantir reconexão com chatid

  const handleWebSocketMessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type || message.Type) {
      case 'newUser':
        handleNewUserMessage(message);
        break;
      case 'removeUser':
        handleRemoveUserMessage(message);
        break;
      case 'receiver':
        handleReceiverMessage(message);
        break;
      case 'typing':
        handleTypingMessage(message);
        break;
      default:
        break;
    }
  };

  const handleNewUserMessage = (message) => {
    if (message.chatid === chat.chatid) {
      setUsers(prevUsers => [...prevUsers, {
        hostid: message.hostid,
        chatname: message.chatRoom,
        chatid: message.chatid,
        username: message.username,
        photo: message.photo
      }]);
    }
  };

  const handleRemoveUserMessage = (message) => {
    if (message.chatid === chat.chatid) {
      setUsers(prevUsers => prevUsers.filter(user => user.hostid !== message.hostid));
      if (message.hostid === userData.data.hostid) {
        navigate(`/dashboard`);
      }
    }
  };

  const handleReceiverMessage = (message) => {
    if (message.upload && message.ChatID === chat.chatid) {
      if (message.Type === 'receiver' && message.HostID === userData.data.hostid) {
        const Message = message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ?
          <SenderImage imageData={message.Message} imageName={message.Type} Hour={message.Timestamp} /> :
          <div className='senderMessage'><PDFViewer Name={message.Name} Message={message.Message} Hour={message.Timestamp} /></div>;

        setMessages(prevMessages => [...prevMessages, Message]);
      } else if (message.Type === 'receiver' && message.HostID !== userData.data.hostid) {
        const Message = message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ?
          <ReceiverImage Name={message.Name} imageData={message.Message} Hour={message.Timestamp} /> :
          <div className='receiverMessage'><PDFViewer Name={message.Name} Message={message.Message} Hour={message.Timestamp} /></div>;

        setMessages(prevMessages => [...prevMessages, Message]);
      }
    } else if (message.Type === 'receiver' && message.HostID !== userData.data.hostid && !message.upload && message.ChatID === chat.chatid) {
      const Message = <ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />;
      setMessages(prevMessages => [...prevMessages, Message]);
    } else if (message.Type === 'receiver' && message.HostID === userData.data.hostid && !message.upload) {
      const Message = <SenderMessage Message={message.Message} />;
      setMessages(prevMessages => [...prevMessages, Message]);
    }
  };

  const handleTypingMessage = (message) => {
    if (message.hostid !== userData.data.hostid) {
      setUserTypingStatus(prevTypingStatus => ({
        ...prevTypingStatus,
        [message.hostid]: message.isTyping
      }));
    }
  };

  const kickUser = async () => {
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/kickuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.data.username,
          hostid: userData.data.hostid,
          chatid: chat.chatid,
          chatname: roomname,
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
    <div className="App">
      <header className="App-header" style={{ background: colors.background }}>
        <div>
          <b classname="friend-list" style={{ cursor: "pointer" }} onClick={handleFriendModal}>Convidar Amigo</b>
          {showFriendModal && (
            <div className="modal-friend">
              <div className="modal-content-friend">
                <span className="close" onClick={handleFriendModal}>&times;</span>
                <h2>Amigos Online</h2>
                {friendRequests?.length ? (
                  friendRequests?.map((user, index) => (
                    <div key={index} className="notification-container">
                      <div className="notification-card">
                        <div className="friend-info">
                          <img
                            src={`data:image/jpeg;base64,${user?.photo_url}`}
                            alt="User photo"
                            className="friend-photo"
                          />
                          <p className="friend-name">{user?.name}</p>
                        </div>
                        <div className="action-buttons">
                          <button
                            className="accept-button"
                            onClick={() => handleInviteRequest(index)}
                          >
                            Convidar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Sem amigos online</p>
                )}
              </div>
            </div>
          )}
          <chatroom style={{ marginLeft: "40vw" }}>{roomname ? roomname : ''}</chatroom>
          <FaSignOutAlt size={24} color={"white"} style={{ marginLeft: "15px", cursor: "pointer" }} onClick={kickUser} />
        </div>
        <div className="Box" style={{ backgroundColor: colors.chatBox, borderColor: colors.border }}>
          <div className="flexBox">
            <div className="columnFlexBox">
              <div style={{ borderBottom: colors.border, borderRadius: "5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
                <ul>
                  {users.map((user, index) => (
                    user.hostid === userData.data.hostid ? null : (
                      <GuestInfo
                        isTyping={userTypingStatus[user.hostid]}
                        hostid={user.hostid}
                        key={index}
                        name={user.username}
                        roomname={user.chatRoom}
                        chat={chat}
                        chatid={user.chatid}
                        photo={`data:image/*;base64,${user.photo}`}  // Passando a imagem base64 como propriedade
                      />
                    )
                  ))}
                </ul>
              </div>
              <HostInfo name={userData.data.username} photo={`data:image/png;base64,${userData.data.UserPhoto.photo}`} theme={colors.border} />
            </div>
            <ChatBox chat={chat} messages={messages} roomname={roomname} theme={colors} setColors={setColors} />
          </div>
        </div>
      </header>
      
    </div>
  );
}

export default ChatRoom;

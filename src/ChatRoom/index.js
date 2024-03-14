import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { format } from 'date-fns';
import PDFViewer from '../ChatBox/ToolBar/UploadFile/PDFViewer';
import ReceiverImage from '../ChatBox/ReceiverImage';
import SenderImage from '../ChatBox/SenderImage';

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
  const [messages, setMessages] = useState([]);
  const { userData } = useContext(ChatContext);
  const [userTypingStatus, setUserTypingStatus] = useState({});
  const [users, setUsers] = useState([]);
  const [colors, setColors] = useState({
    chatBox: '#7d3e5d',
    background: 'linear-gradient(to bottom, #482436, #000000)',
    border: 'white',
  });

  useEffect(() => {
    const socket = new WebSocket('wss://marichat-go.onrender.com/websocket');

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'newUser') {
        if (message.chatRoom === userData.chatroomName) {
          setUsers((prevUsers) => [...prevUsers, message.user]);
        }
      }

      if (message.type === 'removeUser') {
        if (message.chatRoom === userData.chatroomName) {
          setUsers((prevUsers) => prevUsers.filter(user => user !== message.user));
          if (userData.user === message.user) {
            navigate(`/`);
            setUserData(null);
          }
        }
      }

      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.Chatroom === userData.chatroomName) {
        const Message = (<ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />);
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && !message.upload) {
        const Message = (<SenderMessage Message={message.Message} />);
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && message.upload === true) {
        if (message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg') {
          const Message = (<SenderImage imageData={message.Message} Hour={message.Timestamp} />);
          setMessages(prevMessages => [...prevMessages, Message]);
        } else if (message.Label === 'application/pdf') {
          const Message = (<div className='senderMessage'> <PDFViewer Name={message.Name} Message={message.Message} Hour={message.Timestamp} /></div>);
          setMessages(prevMessages => [...prevMessages, Message]);
        }
      }

      if (message.Type === 'receiver' && message.Name !== userData.user && message.upload === true && message.Chatroom === userData.chatroomName) {
        if (message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg') {
          const Message = (<ReceiverImage Name={message.Name} imageData={message.Message} Hour={message.Timestamp} />);
          setMessages(prevMessages => [...prevMessages, Message]);
        } else if (message.Label === 'application/pdf') {
          const Message = (<div className='receiverMessage'><PDFViewer Name={message.Name} Message={message.Message} Hour={message.Timestamp} /></div>);
          setMessages(prevMessages => [...prevMessages, Message]);
        }
      }

      if (message.type === 'typing' && message.user !== userData.user) {
        const updatedTypingStatus = { ...userTypingStatus };
        updatedTypingStatus[message.user] = message.isTyping;
        setUserTypingStatus(updatedTypingStatus);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const kickUser = async () => {
    try {
      const response = await fetch('https://marichat-go.onrender.com/kickUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username": userData.user,
          "roomname": userData.chatroomName,
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
        <div className="Box" style={{ backgroundColor: colors.chatBox, borderColor: colors.border }}>
          <div className="flexBox">
            <div className="columnFlexBox">
              <div style={{ borderBottom: colors.border, borderRadius: "5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
                <ul>
                  {users.map((user) => (
                    user === userData.user ? null : (
                      <GuestInfo
                        isTyping={userTypingStatus[user]}
                        id={user}
                        key={user}
                        name={user}
                      />
                    )
                  ))}
                </ul>
              </div>
              <HostInfo name={userData.user} theme={colors.border} />
            </div>
            <ChatBox messages={messages} theme={colors} setColors={setColors} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default ChatRoom;

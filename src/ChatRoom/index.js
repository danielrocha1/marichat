import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { format } from 'date-fns';
import SenderImage from '../ChatBox/SenderImage';
import ReceiverImage from '../ChatBox/ReceiverImage';
import PDFViewer from '../ChatBox/ToolBar/UploadFile//PDFViewer'

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

function ChatRoom({ children }) {
  const { userData, setUserData } = useContext(ChatContext);
  const navigate = useNavigate();
  
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const chat = Object.fromEntries(searchParams.entries());


  const [roomname, setRoomname] = useState('');



  const [messages, setMessages] = useState([]);
  const [userTypingStatus, setUserTypingStatus] = useState({});
  const [users, setUsers] = useState([{
    isTyping:false,
  }]);
  const [colors, setColors] = useState({
    chatBox: '#7d3e5d',
    background: 'linear-gradient(to bottom, #482436, #000000)',
    border: 'white',
  });

  useEffect((users) => {
    
    const fetchUsers = async (users) => {
      try {
        const response = await fetch('https://marichat-go.onrender.com/listusers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "chatid": chat.chatid }),
        });
        
        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }

        const data = await response.json();
        setUsers(data.users);
        setRoomname(data.roomname);
        
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchUsers();

    


    const socket = new WebSocket('wss://marichat-go.onrender.com/websocket');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("MENSAGEM",message)
      if (message.type === 'newUser') {
        console.log("USERS",users)
        if (message.chatid === chat.chatid) {
          setUsers((prevUsers) => [...prevUsers, {
          "hostid":message.hostid,
          "chatname":message.chatRoom,
          "chatid":message.chatid,
          "username":message.username
          }]);
        }
     
      }
      if (message.type === 'removeUser') {
        if (message.chatid === chat.chatid) {
          setUsers(prevUsers => {
            const updatedUsers = prevUsers.filter(user => user.hostid !== message.hostid);
            return updatedUsers;
          });
          if (message.hostid === userData.data.hostid) {
            navigate(`/dashboard`, userData);
          }
        }
      }

      if (message.Type === 'receiver' && message.HostID !== userData.data.hostid && !message.upload && message.chatRoom === userData.Chatroom) {
        const Message = (<ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />)
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.HostID === userData.data.hostid && !message.upload) {
        const Message = (<SenderMessage Message={message.Message} />);
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.HostID === userData.data.hostid && message.upload === true && message.ChatID === chat.chatid) {
        if (message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg') {
          const Message = (<SenderImage imageData={message.Message} imageName={message.Type} Hour={message.Timestamp} />);
          setMessages(prevMessages => [...prevMessages, Message]);
          
        } else if (message.Label === 'application/pdf') {
          const Message = (<div className='senderMessage'> <PDFViewer Name={message.Name} Message={message.Message} Hour={message.Timestamp} /></div>);
          setMessages(prevMessages => [...prevMessages, Message]);
        }
      }

      if (message.Type === 'receiver' && message.HostID !== userData.data.hostid && message.upload === true && message.ChatID === chat.chatid) {
        if (message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg') {
          const Message = (<ReceiverImage Name={message.Name} imageData={message.Message} Hour={message.Timestamp} />);
          setMessages(prevMessages => [...prevMessages, Message]);
        } else if (message.Label === 'application/pdf') {
          const Message = (<div className='receiverMessage'><PDFViewer Name={message.Name} Message={message.Message} Hour={message.Timestamp} /></div>);
          setMessages(prevMessages => [...prevMessages, Message]);
        }
      }
      console.log(message.type === 'typing' && message.hostid !== userData.data.hostid, "||" , message )
      if (message.type === 'typing' && message.hostid !== userData.data.hostid) {
        const updatedTypingStatus = { ...userTypingStatus };
        updatedTypingStatus[message.hostid] = message.isTyping;
        setUserTypingStatus(updatedTypingStatus);
        console.log("STY", updatedTypingStatus)
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const kickUser = async () => {
    try {
      const response = await fetch('https://marichat-go.onrender.com/kickuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "username": userData.data.username,
          "hostid": userData.data.hostid,
          "chatid": chat.chatid,
          "chatname": roomname,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
      console.log()
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header" style={{ background: colors.background }} >
        <div>
          <chatroom style={{ marginLeft: "710px" }}> {roomname ? roomname : '' } </chatroom>
          <FaSignOutAlt size={24} color={"white"} style={{ marginLeft: "15px", cursor: "pointer" }} onClick={() => kickUser()} />
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
                        chatid={user.chatid}
                      />
                    )
                  ))}
                </ul>
              </div>
              <HostInfo name={userData.data.username} theme={colors.border} />
            </div>
            <ChatBox chat={chat} messages={messages} chat={chat} roomname={roomname} theme={colors} setColors={setColors} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default ChatRoom;

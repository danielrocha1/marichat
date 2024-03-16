import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox';
<<<<<<< HEAD
import { createRoot } from 'react-dom/client'; // Importe createRoot corretamente
import { format } from 'date-fns';

import { FaSignOutAlt } from 'react-icons/fa';

import PDFViewer from '../ChatBox/ToolBar/UploadFile/PDFViewer';
import ReceiverImage from '../ChatBox/ReceiverImage';
import SenderImage from '../ChatBox/SenderImage';

=======
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import SenderImage from '../ChatBox/SenderImage';
import ReceiverImage from '../ChatBox/ReceiverImage';
import PDFViewer from '../ChatBox/ToolBar/UploadFile//PDFViewer'
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548

function ReceiverMessage(props) {
  const timestamp = new Date(props.Hour);
  const hora = format(timestamp, 'HH:mm');
  return (
<<<<<<< HEAD
    <div className="receiverMessage" >
=======
    <div className="receiverMessage">
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
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
<<<<<<< HEAD
  const [messages, setMessages] = useState([]); // Estado para armazenar as mensagens

  const { userData } = useContext(ChatContext);
  const [userTypingStatus, setUserTypingStatus] = useState({}); // Estado para armazenar o status de digitação de cada usuário
  const [users, setUsers] = useState([]);
  const [colors, setColors] = useState({
    chatBox: '#7d3e5d', // Cor primária
    background: 'linear-gradient(to bottom, #482436, #000000)',
    border:"white", // Gradiente linear para o plano de fundo
=======
  const { userData, setUserData } = useContext(ChatContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [userTypingStatus, setUserTypingStatus] = useState({});
  const [users, setUsers] = useState([]);
  const [colors, setColors] = useState({
    chatBox: '#7d3e5d',
    background: 'linear-gradient(to bottom, #482436, #000000)',
    border: 'white',
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://marichat-go.onrender.com/listusers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "roomname": userData.chatroomName }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };

    fetchUsers();

    const socket = new WebSocket('wss://marichat-go.onrender.com/websocket');
    socket.onmessage = (event) => {
<<<<<<< HEAD
      
      const message = JSON.parse(event.data);
      const tempElement = document.createElement('div');
      const userElement = document.getElementById(message.user);
      console.log("TESTASYDvgsyv",message, userData)


      if (message.type === 'newUser' ) {
        if (message.chatRoom === userData.chatroomName){
=======
      const message = JSON.parse(event.data);

      if (message.type === 'newUser') {
        if (message.chatRoom === userData.chatroomName) {
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
          setUsers((prevUsers) => [...prevUsers, message.user]);
        }
      }

<<<<<<< HEAD
      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.Chatroom === userData.chatroomName ) {
        console.log("TEST",message.ChatRoom === userData.chatroomName)
        const Message = (<ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />)
        // chatScreen.appendChild(tempElement);

=======
      if (message.type === 'deleteUser') {
        if (message.chatRoom === userData.chatroomName) {
          setUsers(prevUsers => {
            const updatedUsers = prevUsers.filter(user => user !== message.user);
            return updatedUsers;
          });
          if (userData.user === message.user) {
            navigate(`/`);
            setUserData(null)
          }
        }
      }

      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.Chatroom === userData.chatroomName) {
        const Message = (<ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />)
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && !message.upload) {
<<<<<<< HEAD
        console.log(message, "MENSAGEM PORRA")     
        const Message = (<SenderMessage Message={message.Message} />);
        
        console.log(Message)
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && message.upload === true ) {
        if(message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ){
        const Message = (<SenderImage imageData={message.Message}  Hour={message.Timestamp}/>);


        setMessages(prevMessages => [...prevMessages, Message]);
      }else if (message.Label === 'application/pdf' ){
      console.log("usuario mandou um pdf")
      const Message = (<div className='senderMessage'> <PDFViewer Name={message.Name} Message={message.Message}  Hour={message.Timestamp}/></div>);
    

      setMessages(prevMessages => [...prevMessages, Message]);
    }
  }


    if (message.Type === 'receiver' && message.Name !== userData.user && message.upload === true && message.Chatroom === userData.chatroomName ) {
      if(message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ){
        console.log("AQUI CARAIO")
        const Message = (<ReceiverImage Name={message.Name} imageData={message.Message}  Hour={message.Timestamp}/>);
        setMessages(prevMessages => [...prevMessages, Message]);
      }else if (message.Label === 'application/pdf' ){
        const Message = (<div className='receiverMessage'><PDFViewer Name={message.Name} Message={message.Message}  Hour={message.Timestamp}/></div>);
        setMessages(prevMessages => [...prevMessages, Message]);

      }
    }
=======
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
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548

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
<<<<<<< HEAD
      const response = await fetch('https://marichat-go.onrender.com/kickUser', {
=======
      const response = await fetch('https://marichat-go.onrender.com/deleteuser', {
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
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
      <header className="App-header" style={{ background: colors.background }} >
<<<<<<< HEAD
      <div>
        <chatroom style={{marginLeft:"710px" }} >  {userData.chatroomName} </chatroom>
        <FaSignOutAlt size={24} color={"white"} style={{marginLeft:"15px", cursor:"pointer" }} onClick={() => kickUser()} />
      </div>
        <div className="Box"  style={{backgroundColor:colors.chatBox, borderColor:colors.border }}>
          <div className="flexBox" >
            <div className="columnFlexBox" >
              <div style={{borderBottom:colors.border, borderRadius:"5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain'}}>
=======
        <div>
          <chatroom style={{ marginLeft: "710px" }}> {userData.chatroomName} </chatroom>
          <FaSignOutAlt size={24} color={"white"} style={{ marginLeft: "15px", cursor: "pointer" }} onClick={() => kickUser()} />
        </div>
        <div className="Box" style={{ backgroundColor: colors.chatBox, borderColor: colors.border }}>
          <div className="flexBox">
            <div className="columnFlexBox">
              <div style={{ borderBottom: colors.border, borderRadius: "5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
                <ul>
                  {users.map((user) => (
                    user === userData.user ? null : (
                      <GuestInfo
<<<<<<< HEAD
                        isTyping={userTypingStatus[user]} // Passa o estado de digitação do usuário
                        id={user}
                        key={user}
                        name={user}
=======
                        isTyping={userTypingStatus[user]}
                        id={user}
                        key={user}
                        name={user}
                        roomname={userData.chatroomName}
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
                      />
                    )
                  ))}
                </ul>
              </div>
<<<<<<< HEAD
              <HostInfo name={userData.user} theme={colors.border}/>
=======
              <HostInfo name={userData.user} theme={colors.border} />
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
            </div>
            <ChatBox messages={messages} theme={colors} setColors={setColors} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default ChatRoom;

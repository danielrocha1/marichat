import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
<<<<<<< HEAD
<<<<<<< HEAD
import ChatBox from '../ChatBox';

import { FaSignOutAlt } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

import { createRoot } from 'react-dom/client'; // Importe createRoot corretamente
import { format } from 'date-fns';

import PDFViewer from '../ChatBox/ToolBar/UploadFile/PDFViewer';
import ReceiverImage from '../ChatBox/ReceiverImage';
import SenderImage from '../ChatBox/SenderImage';

=======
import ChatBox from '../ChatBox'
import { render } from 'react-dom'; 
import { format } from 'date-fns';

>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)

function ReceiverMessage(props) {
  const timestamp = new Date(props.Hour);
  const hora = format(timestamp, 'HH:mm');
<<<<<<< HEAD
  return (
    <div className="receiverMessage" >
      <p style={{ fontSize: '15px', textAlign: 'left', fontWeight: 'bold' }}>{props.Name}:</p>
      {props.Message}
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
=======
  console.log(props.Message, 'ReceiverMessage')
=======
import ChatBox from '../ChatBox';

import { FaSignOutAlt } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

import { createRoot } from 'react-dom/client'; // Importe createRoot corretamente
import { format } from 'date-fns';

import PDFViewer from '../ChatBox/ToolBar/UploadFile/PDFViewer';
import ReceiverImage from '../ChatBox/ReceiverImage';
import SenderImage from '../ChatBox/SenderImage';


function ReceiverMessage(props) {
  const timestamp = new Date(props.Hour);
  const hora = format(timestamp, 'HH:mm');
<<<<<<< HEAD
  console.log(props.Message, 'ReceiverMessage');
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
  return (
    <div className="receiverMessage" >
      <p style={{ fontSize: '15px', textAlign: 'left', fontWeight: 'bold' }}>{props.Name}:</p>
      {props.Message}
<<<<<<< HEAD
      <p style={{ fontSize: '7px', textAlign: 'right' , fontWeight:"bold" }}>{hora}</p>
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
    </div>
  );
}

function SenderMessage(props) {
<<<<<<< HEAD
<<<<<<< HEAD
  const timestamp = new Date();
  const hora = format(timestamp, 'HH:mm');
=======
  console.log(props.Message, 'SENDER')
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
=======
  const timestamp = new Date();
  const hora = format(timestamp, 'HH:mm');
<<<<<<< HEAD
  console.log(props.Message, 'SENDER');
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
  return (
    <div className="senderMessage">
      {props.Message}
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
    </div>
  );
}

function ChatRoom({ children }) {
<<<<<<< HEAD
<<<<<<< HEAD
  const [messages, setMessages] = useState([]); // Estado para armazenar as mensagens

  const navigate = useNavigate();

  const { userData, setUserData } = useContext(ChatContext);
<<<<<<< HEAD
=======
=======
  const [messages, setMessages] = useState([]); // Estado para armazenar as mensagens

>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
  const { userData } = useContext(ChatContext);
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
>>>>>>> 4d3b67d (commit)
  const [userTypingStatus, setUserTypingStatus] = useState({}); // Estado para armazenar o status de digitação de cada usuário
  const [users, setUsers] = useState([]);
  const [colors, setColors] = useState({
    chatBox: '#7d3e5d', // Cor primária
    background: 'linear-gradient(to bottom, #482436, #000000)',
    border:"white", // Gradiente linear para o plano de fundo
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

<<<<<<< HEAD
<<<<<<< HEAD
    const socket = new WebSocket('wss://localhost:8080/websocket');
=======
    const socket = new WebSocket('ws://localhost:8080/websocket');
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
    socket.onmessage = (event) => {
      
      const message = JSON.parse(event.data);
<<<<<<< HEAD


      if (message.type === 'newUser' ) {
        if (message.chatRoom === userData.chatroomName){
          setUsers((prevUsers) => [...prevUsers, message.user]);
        }
      }

      if (message.type === 'removeUser') {
        if (message.chatRoom === userData.chatroomName) {
          
              setUsers(prevUsers => {
                const updatedUsers = prevUsers.filter(user => user !== message.user);
                return updatedUsers;
            });
          if( userData.user === message.user){
            navigate(`/offline`);
            setUserData(null)
        }
        }
      }

      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.Chatroom === userData.chatroomName ) {
        console.log("TEST",message.ChatRoom === userData.chatroomName)
        const Message = (<ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />)
        // chatScreen.appendChild(tempElement);

        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && !message.upload) {
        console.log(message, "MENSAGEM PORRA")     
        const Message = (<SenderMessage Message={message.Message} />);
        
        console.log(Message)
        setMessages(prevMessages => [...prevMessages, Message]);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && message.upload === true ) {
        if(message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ){
        const Message = (<SenderImage imageData={message.Message}  Hour={message.Timestamp}/>);
=======
      const tempElement = document.createElement('div');
      const userElement = document.getElementById(message.user);
      console.log("TESTASYDvgsyv",message, userData)
=======
    const socket = new WebSocket('wss://localhost:8080/websocket');
    socket.onmessage = (event) => {
      
      const message = JSON.parse(event.data);
>>>>>>> 4d3b67d (commit)


      if (message.type === 'newUser' ) {
        if (message.chatRoom === userData.chatroomName){
          setUsers((prevUsers) => [...prevUsers, message.user]);
        }
      }

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        const tempElement = document.createElement('div');
        render(<ReceiverMessage Name={message.Name} Message={newMessage} Hour={message.Timestamp} />, tempElement);
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)


<<<<<<< HEAD
        setMessages(prevMessages => [...prevMessages, Message]);
      }else if (message.Label === 'application/pdf' ){
      console.log("usuario mandou um pdf")
      const Message = (<div className='senderMessage'> <PDFViewer Name={message.Name} Message={message.Message}  Hour={message.Timestamp}/></div>);
    
=======
      }if (message.Type === 'receiver' && message.Name === userData.user ) {
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)

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

      if (message.type === 'typing' && message.user !== userData.user) {
        const updatedTypingStatus = { ...userTypingStatus };
        updatedTypingStatus[message.user] = message.isTyping;
        setUserTypingStatus(updatedTypingStatus);
=======
      if (message.Type === 'receiver' && message.Name !== userData.user) {
=======
      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.ChatRoom === userData.chatroomName ) {
=======
=======
      if (message.type === 'removeUser') {
        if (message.chatRoom === userData.chatroomName) {
          
              setUsers(prevUsers => {
                const updatedUsers = prevUsers.filter(user => user !== message.user);
                return updatedUsers;
            });
          if( userData.user === message.user){
            navigate(`/offline`);
            setUserData(null)
        }
        }
      }

>>>>>>> 4d3b67d (commit)
      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.Chatroom === userData.chatroomName ) {
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
        console.log("TEST",message.ChatRoom === userData.chatroomName)
        const Message = (<ReceiverMessage Name={message.Name} Message={message.Message} Hour={message.Timestamp} />)
        // chatScreen.appendChild(tempElement);

<<<<<<< HEAD
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        
        createRoot(tempElement).render(<ReceiverMessage Name={message.Name} Message={newMessage} Hour={message.Timestamp} />);
        chatScreen.appendChild(tempElement);
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
        setMessages(prevMessages => [...prevMessages, Message]);
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
      }

      if (message.Type === 'receiver' && message.Name === userData.user && !message.upload) {
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
<<<<<<< HEAD
<<<<<<< HEAD
      <header className="App-header" style={{ background: colors.background }} >
      <div>
        <chatroom style={{marginLeft:"710px" }} >  {userData.chatroomName} </chatroom>
        <FaSignOutAlt size={24} color={"white"} style={{marginLeft:"15px", cursor:"pointer" }} onClick={() => kickUser()} />
      </div>
<<<<<<< HEAD
=======
      <header className="App-header" style={{ background: colors.background }} >
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
=======
>>>>>>> 4d3b67d (commit)
        <div className="Box"  style={{backgroundColor:colors.chatBox, borderColor:colors.border }}>
          <div className="flexBox" >
            <div className="columnFlexBox" >
              <div style={{borderBottom:colors.border, borderRadius:"5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain'}}>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4d3b67d (commit)
              <ul>
              {users.map((user) => (
              user === userData.user ? null : (
              <GuestInfo
                isTyping={userTypingStatus[user]} // Passa o estado de digitação do usuário
                id={user}
                key={user}
                name={user}
                roomname={userData.chatroomName}
              />
              )
              ))}
              </ul>
<<<<<<< HEAD
              </div>
              <HostInfo name={userData.user} theme={colors.border}/>
=======
      <header className="App-header">
        <div className="Box">
          <div className="flexBox">
            <div className="columnFlexBox">
              <div style={{borderBottom:"1px solid white", borderRadius:"5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
=======
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
                <ul>
                  {users.map((user) => (
                    user === userData.user ? null : (
                      <GuestInfo
                        isTyping={userTypingStatus[user]} // Passa o estado de digitação do usuário
                        id={user}
                        key={user}
                        name={user}
                      />
                    )
                  ))}
                </ul>
=======
>>>>>>> 4d3b67d (commit)
              </div>
              <HostInfo name={userData.user} theme={colors.border}/>
            </div>
<<<<<<< HEAD
<<<<<<< HEAD
              <HostInfo name={userData.user}/>
              
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
            </div>
            <ChatBox messages={messages} theme={colors} setColors={setColors} />
=======
            <ChatBox />
>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
            <ChatBox messages={messages} theme={colors} setColors={setColors} />
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
          </div>
        </div>
      </header>
    </div>
  );
}

export default ChatRoom;

import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox';
import { createRoot } from 'react-dom/client'; // Importe createRoot corretamente
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
    <div className="">
      {props.Message}
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
    </div>
  );
}

function ChatRoom({ children }) {
  const { userData } = useContext(ChatContext);
  const [userTypingStatus, setUserTypingStatus] = useState({}); // Estado para armazenar o status de digitação de cada usuário
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/listusers', {
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

    const socket = new WebSocket('ws://localhost:8080/websocket');
    socket.onmessage = (event) => {
      
      const message = JSON.parse(event.data);
      const tempElement = document.createElement('div');
      const userElement = document.getElementById(message.user);
      console.log("TESTASYDvgsyv",message, userData)


      if (message.type === 'newUser' ) {
        if (message.chatRoom === userData.chatroomName){
          setUsers((prevUsers) => [...prevUsers, message.user]);
        }
      }

      if (message.Type === 'receiver' && message.Name !== userData.user && !message.upload && message.Chatroom === userData.chatroomName ) {
        console.log("TEST",message.ChatRoom === userData.chatroomName)

        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        
        createRoot(tempElement).render(<ReceiverMessage Name={message.Name} Message={newMessage} Hour={message.Timestamp} />);
        chatScreen.appendChild(tempElement);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && !message.upload) {
        console.log(message, "MENSAGEM PORRA")
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        tempElement.className = 'senderMessage';
        createRoot(tempElement).render(<SenderMessage Message={newMessage} />);
        chatScreen.appendChild(tempElement);
      }

      if (message.Type === 'receiver' && message.Name === userData.user && message.upload === true ) {
        if(message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ){
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        tempElement.className = 'senderMessage';
        createRoot(tempElement).render(<SenderImage imageData={newMessage}  Hour={message.Timestamp}/>);
        chatScreen.appendChild(tempElement);
      }else if (message.Label === 'application/pdf' ){
      console.log("usuario mandou um pdf")
      const newMessage = message.Message;
      const chatScreen = document.querySelector(".chatScreen");
      const tempElement = document.createElement('div');
      tempElement.className = 'senderMessage';
      createRoot(tempElement).render(<PDFViewer Name={message.Name} Message={newMessage}  Hour={message.Timestamp}/>);
      chatScreen.appendChild(tempElement);

    }
  }


    if (message.Type === 'receiver' && message.Name !== userData.user && message.upload === true && message.Chatroom === userData.chatroomName ) {
      if(message.Label === 'image/png' || message.Label === 'image/jpg' || message.Label === 'image/jpeg' ){
        console.log("AQUI CARAIO")
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        tempElement.className = 'receiverMessage';
        createRoot(tempElement).render(<ReceiverImage Name={message.Name} imageData={newMessage}  Hour={message.Timestamp}/>);
        chatScreen.appendChild(tempElement);
      }else if (message.Label === 'application/pdf' ){
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        tempElement.className = 'receiverMessage';
        createRoot(tempElement).render(<PDFViewer Name={message.Name} Message={newMessage}  Hour={message.Timestamp}/>);
        chatScreen.appendChild(tempElement);

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

  return (
    <div className="App">
      <header className="App-header">
        <div className="Box">
          <div className="flexBox">
            <div className="columnFlexBox">
              <div style={{borderBottom:"1px solid white", borderRadius:"5px", maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
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
              </div>
              <HostInfo name={userData.user} />
            </div>
            <ChatBox />
          </div>
        </div>
      </header>
    </div>
  );
}

export default ChatRoom;

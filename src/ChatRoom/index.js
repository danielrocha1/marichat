import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox';
import { createRoot } from 'react-dom/client'; // Importe createRoot corretamente
import { format } from 'date-fns';

function ReceiverMessage(props) {
  const timestamp = new Date(props.Hour);
  const hora = format(timestamp, 'HH:mm');
  console.log(props.Message, 'ReceiverMessage');
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
  console.log(props.Message, 'SENDER');
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

      if (message.type === 'newUser') {
        setUsers((prevUsers) => [...prevUsers, message.user]);
      }

      if (message.Type === 'receiver' && message.Name !== userData.user) {
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        createRoot(tempElement).render(<ReceiverMessage Name={message.Name} Message={newMessage} Hour={message.Timestamp} />);
        chatScreen.appendChild(tempElement);
      }

      if (message.Type === 'receiver' && message.Name === userData.user) {
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");
        const tempElement = document.createElement('div');
        tempElement.className = 'senderMessage';
        createRoot(tempElement).render(<SenderMessage Message={newMessage} />);
        chatScreen.appendChild(tempElement);
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
              <div style={{ maxHeight: '280px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
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

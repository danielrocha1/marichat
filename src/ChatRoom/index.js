import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox'
import { render } from 'react-dom'; 
import { format } from 'date-fns';


function ReceiverMessage(props) {
  const timestamp = new Date(props.Hour);
  const hora = format(timestamp, 'HH:mm');
  console.log(props.Message, 'ReceiverMessage')
  return (
 

    <div className="receiverMessage">
      <p style={{ fontSize: '15px', textAlign: 'left' ,fontWeight:"bold" }}>{props.Name}:</p>
      {props.Message}
      <p style={{ fontSize: '7px', textAlign: 'right' , fontWeight:"bold" }}>{hora}</p>
    </div>
  );
}

function SenderMessage(props) {
  console.log(props.Message, 'SENDER')
  return (
    <div className="">
      {props.Message}
    </div>
  );
}


function ChatRoom({children}) {
  const { userData } = useContext(ChatContext);

  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Função para buscar os usuários na sala de bate-papo do backend
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
    
        const data = await response.json(); // Correção: obter os dados formatados corretamente
        
        setUsers(data.users); // Correção: definir o estado users com os dados corretos
      } catch (error) {
        console.error('Erro:', error.message);
      }
    };
  
    // Chamada da função para buscar os usuários ao montar o componente
    fetchUsers();
  
    // Exemplo de uso de Websockets para atualizar a lista de usuários em tempo real
    const socket = new WebSocket('ws://localhost:8080/websocket');
    socket.onmessage = (event) => {

      const message = JSON.parse(event.data);
      const tempElement = document.createElement('div');
      const userElement = document.getElementById(message.user);
      if (message.type === 'newUser') {
        setUsers((prevUsers) => [...prevUsers, message.user]);
      }
      if (message.Type === 'receiver' && message.Name !== userData.user ) {
        
       
        const newMessage = message.Message;
        console.log("Nova mensagem recebida:", newMessage);
        
        const chatScreen = document.querySelector(".chatScreen");

        const tempElement = document.createElement('div');
        render(<ReceiverMessage Name={message.Name} Message={newMessage} Hour={message.Timestamp} />, tempElement);

        chatScreen.appendChild(tempElement);

      }if (message.Type === 'receiver' && message.Name === userData.user ) {
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");

        const tempElement = document.createElement('div');
        tempElement.className = 'senderMessage'
        render(<SenderMessage Message={newMessage} />, tempElement);
        console.log("Nova mensagem ADSFASD:", tempElement);
        chatScreen.appendChild(tempElement);
      }

  
      
      if (message.type === 'typing' && message.user !== userData.user ) {
          if (message.isTyping === true) {
              // Exibe a mensagem de "Digitando..."
              tempElement.className = 'typing';
              tempElement.innerHTML = '<p>Digitando...</p>';
      
              // Adiciona a mensagem de "Digitando..." ao lado do nome do usuário
              if (userElement) {
                  userElement.appendChild(tempElement);
              }
          } else if (message.isTyping === false) {
            var  guestElement = document.getElementById(message.user)
              // Remove a mensagem de "Digitando..." se ela existir
              if (guestElement.querySelector('.typing')) {
                console.log(guestElement.querySelector('.typing'), "GUST")
                guestElement.querySelector('.typing').remove();
              }
            }
      }
      
    };
  
    // Função de limpeza ao desmontar o componente
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
                user === userData.user ? null : <GuestInfo id={user} key={user} name={user} />
              ))}
            </ul>
            </div>
              <HostInfo name={userData.user}/>
              
            </div>
            <ChatBox/>
          </div>
        </div>
      </header>
    </div>
  );
}

export default ChatRoom;






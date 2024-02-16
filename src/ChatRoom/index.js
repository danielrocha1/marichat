import './index.css';
import React, { useState, useEffect, useContext } from 'react';
import ChatContext from '../ChatContext';
import HostInfo from '../HostInfo';
import GuestInfo from '../GuestInfo';
import ChatBox from '../ChatBox'
import { render } from 'react-dom'; 

function ReceiverMessage(props) {
  console.log(props.Message, 'SENDER')
  return (
    <div className="receiverMessage">
      {props.Message}
    </div>
  );
}

function SenderMessage(props) {
  
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
      
      if (message.type === 'newUser') {
        setUsers((prevUsers) => [...prevUsers, message.user]);
      }
      console.log('message.Name ', userData)
      if (!message.type && message.Name !== userData.user ) {
        
       
        const newMessage = message.Message;
        console.log("Nova mensagem recebida:", newMessage);
        
       
        
        const chatScreen = document.querySelector(".chatScreen");

        const tempElement = document.createElement('div');
        render(<ReceiverMessage Message={newMessage} />, tempElement);

        chatScreen.appendChild(tempElement);

      }else{
        const newMessage = message.Message;
        const chatScreen = document.querySelector(".chatScreen");

        const tempElement = document.createElement('div');
        tempElement.className = 'senderMessage'
        render(<SenderMessage Message={newMessage} />, tempElement);
        console.log("Nova mensagem ADSFASD:", tempElement);
        chatScreen.appendChild(tempElement);
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
            <div style={{ maxHeight: '150px', overflowY: 'auto', scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
  <ul>
    {users.map((user) => (
      <GuestInfo key={user} name={user} />
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






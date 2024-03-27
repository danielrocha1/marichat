import React, { useState } from 'react';
import './index.css';

const Login = ({ handleLoginSubmit, setUser, setChatroomName, user, chatroomName }) => {
  return (
    <div style={{borderTop:"1px solid #e5c7c7"}}>
      <form onSubmit={handleLoginSubmit} className="form">
        <h2>Login</h2>
        <div className="for-group">
          <label htmlFor="user">Usuário:</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="for-group">
          <label htmlFor="chatroomName">Senha:</label>
          <input
            type="text"
            id="chatroomName"
            value={chatroomName}
            onChange={(e) => setChatroomName(e.target.value)}
          />
        </div>
        <button type="submit">Fazer Login</button>
      </form>
    </div>
  );
}

const SignUp = ({handleRegisterSubmit, setUser, user,}) => {
  return (
    <div style={{borderTop:"1px solid #e5c7c7"}}>
      <form onSubmit={handleRegisterSubmit} className="form">
        <h2>Criar Conta</h2>
        <div className="for-group">
          <label htmlFor="user">Nome Completo:</label>
          <input
            type="text"
            id="FullName"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="for-group">
          <label htmlFor="user">Nome de usuário:</label>
          <input
            type="text"
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="for-group">
          <label htmlFor="user">Email:</label>
          <input
            type="email"
            id="email"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="for-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="for-group">
          <label htmlFor="user">Data de Nascimento:</label>
          <input
            type="date"
            id="Birthdate"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

const LoginButton = ({ onClick }) => {
  return (
    <p>LOG IN</p>
  );
}

const SignUpButton = ({ onClick }) => {
  return (
    <p>SIGN UP</p>
  );
}

function LoginSign() {
  const [user, setUser] = useState('');
  const [chatroomName, setChatroomName] = useState('');
  const [showLogin, setShowLogin] = useState(true); // Estado para controlar a exibição do formulário de login

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    console.log(e)
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log(e)
  };
  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleSignUpClick = () => {
    setShowLogin(false);
  };

  return (
    
    <div className="center-form">
      <div className="top-options">
      <div onClick={handleLoginClick} className="options">
        <LoginButton />
         </div>
        <div style={{backgroundColor:"#007bff",height:"35px", width:"1px"}}/>
      <div onClick={handleSignUpClick} className="options">
        <SignUpButton  />
        </div>
        </div>

        {showLogin ? (
        <Login
          handleLoginSubmit={handleLoginSubmit}
          setUser={setUser}
          setChatroomName={setChatroomName}
          user={user}
          chatroomName={chatroomName}
        />
      ) : (
        <SignUp 
        handleRegisterSubmit={handleRegisterSubmit}
        user={user}
        setUser={setUser}
        />
      )}
    </div>
  );
}

export default LoginSign;


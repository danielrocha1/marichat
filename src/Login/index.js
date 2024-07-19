import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContext from '../ChatContext'; // Importe o contexto aqui

import './index.css';
import { v4 as uuidv4 } from 'uuid';

const Login = ({ handleLoginSubmit, formData, handleChange }) => {
  return (
    <div style={{ borderTop: "1px solid #e5c7c7" }}>
      <form onSubmit={handleLoginSubmit} className="form">
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email} // Corrigido aqui
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button className='loginbutton' type="submit">Fazer Login</button>
      </form>
    </div>
  );
}

const SignUp = ({ handleRegisterSubmit, formData, handleChange }) => {
  return (
    <div style={{ borderTop: "1px solid #e5c7c7" }}>
      <form onSubmit={handleRegisterSubmit} className="form">
        <h2>Criar Conta</h2>
        <div className="form-group">
          <label htmlFor="fullName">Nome Completo:</label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Nome de usuário:</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email} // Corrigido aqui
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="birthdate">Data de Nascimento:</label>
          <input
            type="date"
            id="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />
        </div>
        <button className='loginbutton' type="submit">Registrar</button>
      </form>
    </div>
  );
}

function LoginSign() {
  const navigate = useNavigate();
  const { setUserData } = useContext(ChatContext);

  const [formData, setFormData] = useState({
    hostid: '',
    password: '',
    fullName: '',
    username: '',
    email: '',
    birthdate: ''
  });
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const generatedHostId = uuidv4();
    setFormData(prevData => ({
      ...prevData,
      hostid: generatedHostId
    }));
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }

    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('https://marichat-go-xtcz.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "email": formData.email,
          "password": formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar os dados');
      }
      const data = await response.json();

      setUserData({ data });
      navigate(`/dashboard`);

    } catch (error) {
      console.error('Erro:', error.message);
    }
  };
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
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
          <p>LOG IN</p>
        </div>
        <div style={{ backgroundColor: "#007bff", height: "35px", width: "1px" }} />
        <div onClick={handleSignUpClick} className="options">
          <p>SIGN UP</p>
        </div>
      </div>
      {showLogin ? (
        <Login
          handleLoginSubmit={handleLoginSubmit}
          formData={formData}
          handleChange={handleChange}
        />
      ) : (
        <SignUp
          handleRegisterSubmit={handleRegisterSubmit}
          formData={formData}
          handleChange={handleChange}
        />
      )}
    </div>
  );
}

export default LoginSign;

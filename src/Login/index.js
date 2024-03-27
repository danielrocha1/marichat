import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

function LoginSign() {
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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Implementar lógica de registro aqui
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Implementar lógica de login aqui
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

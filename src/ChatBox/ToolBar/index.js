import React from 'react';
import  './index.css';

function Toolbar() {
  return (
    <div className="toolbar">
      <div className="icon">
        <span role="img" aria-label="Emoji">😊</span>
      </div>
      <div className="icon">
        <span role="img" aria-label="Anexo">📎</span>
      </div>
      <div className="icon">
        <span role="img" aria-label="Sticker">🎨</span>
      </div>
      <div className="icon">
        <span role="img" aria-label="Webcam">📷</span>
      </div>
      <div className="icon">
        <span role="img" aria-label="Mensagem de Voz">🎤</span>
      </div>
    </div>
  );
}

export default Toolbar;

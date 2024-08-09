import React, { useState } from 'react';
import { Smile, Paperclip, Edit2 } from 'react-feather';
import Picker from '@emoji-mart/react';
import UploadFile from './UploadFile';
import ColorSelector from './ColorSelector';
import './index.css';

function Toolbar({ chat, roomname, setShowEmoji, setText, theme, setColors }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado como booleano

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSelectEmoji = (event) => {
    setText((prevText) => (prevText ? prevText + event.native : event.native));
    
  };

  const handleOpenModal = () => {
    setIsModalOpen((prev) => !prev); // Alterna entre aberto e fechado
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Garante que o modal seja fechado
  };

  const handleSelectColor = (color, index) => {
    if (index === "chat") {
      setColors((prevState) => ({
        ...prevState,
        chatBox: color,
      }));
    } else if (index === "fundo") {
      setColors((prevState) => ({
        ...prevState,
        background: color,
      }));
    } else if (index === "bordas") {
      setColors((prevState) => ({
        ...prevState,
        border: color,
      }));
    }
  };

  return (
    <div className="toolbar" style={{ color: theme.border }}>
      <div className="icon" onClick={handleEmojiClick}>
        <Smile />
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker
            set="apple"
            onEmojiSelect={handleSelectEmoji}
            emojiSize={24}
            title="Pick your emoji…"
            emoji="point_up"
            showSkinTones={false}
            style={{ maxWidth: '100%', border: '10px solid #ccc', borderRadius: '5px' }}
          />
        </div>
      )}
      <label htmlFor="file-upload" className="icon">
        <Paperclip />
      </label>
      <UploadFile chat={chat} roomname={roomname} id="file-upload" setText={setText} />
      <div className="icon">
        <Edit2 onClick={handleOpenModal} />
      </div>
      <ColorSelector isOpen={isModalOpen} onSelectColor={handleSelectColor} />
    </div>
  );
}

export default Toolbar;
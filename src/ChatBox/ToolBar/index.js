import React, { useState } from 'react';
import { Smile, Paperclip, Edit2 } from 'react-feather';
import Picker from '@emoji-mart/react';
import UploadFile from './UploadFile';
import ColorSelector from './ColorSelector';
import './index.css';



const Sidebar = () => {
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`sidebarChat ${isSidebarOpen ? 'open' : ''}`}>
      <div>
        <div onClick={toggleSidebar} className="toggle-btn">
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
      </div>
      <div className="user-info">
        <p>Email: </p>
      </div>
      
    </div>
  );
};

function Toolbar({ chat, roomname, setShowEmoji, setText, theme, setColors }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSelectEmoji = (event) => {
    setText((prevText) => prevText + event.native);
    setShowEmojiPicker(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSelectColor = (color, index) => {
    if(index === "chat"){
      setColors(prevState => ({
        ...prevState,
        chatBox: color,
      }));  
    }if(index === "fundo"){
      setColors(prevState => ({
        ...prevState,
        background: color,
      }));  
    }if(index === "bordas"){
      setColors(prevState => ({
        ...prevState,
        border: color,
      }));  
    }
  };

  return (
    <div className="toolbar" style={{color:theme.border}}>
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
      <ColorSelector isOpen={isModalOpen} onClose={handleCloseModal} onSelectColor={handleSelectColor} />
    </div>
  );
}

export default Toolbar;

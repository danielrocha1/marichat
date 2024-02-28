import React, { useState } from 'react';
import { Smile, Paperclip, Edit2, Camera, Mic } from 'react-feather';
import Picker from '@emoji-mart/react';
import UploadFile from './UploadFile'; // Importe o componente UploadFile
import './index.css';

function Toolbar({ setShowEmoji, setText }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSelectEmoji = (event) => {
    console.log('Emoji selecionado:', event.native);
    setText((prevText) => prevText + event.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="toolbar">
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
          />
        </div>
      )}
      {/* Renderize o componente UploadFile */}
      <label htmlFor="file-upload" className="icon">
        <Paperclip />
      </label>
      {/* Renderize o componente UploadFile */}
      <UploadFile id="file-upload" setText={setText} />
      <div className="icon">
        <Edit2 />
      </div>
      <div className="icon">
        <Camera />
      </div>
      <div className="icon">
        <Mic />
      </div>
    </div>
  );
}

export default Toolbar;

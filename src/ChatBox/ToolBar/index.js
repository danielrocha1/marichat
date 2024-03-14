import React, { useState } from 'react';
import { Smile, Paperclip, Edit2, Camera, Mic } from 'react-feather';
import Picker from '@emoji-mart/react';
import UploadFile from './UploadFile'; // Importe o componente UploadFile
<<<<<<< HEAD
<<<<<<< HEAD
import ColorSelector from './ColorSelector';
import './index.css';

function Toolbar({ setShowEmoji, setText, theme, setColors}) {
=======
import './index.css';

function Toolbar({ setShowEmoji, setText }) {
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
import ColorSelector from './ColorSelector';
import './index.css';

function Toolbar({ setShowEmoji, setText, theme, setColors}) {
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSelectEmoji = (event) => {
    console.log('Emoji selecionado:', event.native);
    setText((prevText) => prevText + event.native);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
    // setShowEmojiPicker(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSelectColor = (color, index) => {
    console.log("cor selecionado", index)
    if(index === "chat"){
      console.log(index)
      setColors(prevState => ({
        ...prevState,
        chatBox: color,
      }));  
    }if(index === "fundo"){
      console.log(index)
      setColors(prevState => ({
        ...prevState,
        background: color,
      }));  
    }if(index === "bordas"){
      console.log(index)
      setColors(prevState => ({
        ...prevState,
        border: color,
      }));  
    }
    
<<<<<<< HEAD
  };

  return (
    <div className="toolbar" style={{color:theme.border}}>
      <div className="icon" onClick={handleEmojiClick}>
        <Smile />
=======
    setShowEmojiPicker(false);
=======
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
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
            showsskinTones={false}
            style={{ maxWidth: '100%', border: '10px solid #ccc', borderRadius: '5px' }}
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
<<<<<<< HEAD
        <Edit2 />
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
      </div>
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker
            set="apple"
            onEmojiSelect={handleSelectEmoji}
            emojiSize={24}
            title="Pick your emoji…"
            emoji="point_up"
            showsskinTones={false}
            style={{ maxWidth: '100%', border: '10px solid #ccc', borderRadius: '5px' }}
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
<<<<<<< HEAD
        <Edit2 onClick={handleOpenModal} />
      <ColorSelector isOpen={isModalOpen} onClose={handleCloseModal} onSelectColor={handleSelectColor} />
=======
        <Camera />
      </div>
      <div className="icon">
        <Mic />
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
        <Edit2 onClick={handleOpenModal} />
      <ColorSelector isOpen={isModalOpen} onClose={handleCloseModal} onSelectColor={handleSelectColor} />
>>>>>>> 2a2e5d3 (Chat podendo alterar as cores)
      </div>
    </div>
  );
}

export default Toolbar;

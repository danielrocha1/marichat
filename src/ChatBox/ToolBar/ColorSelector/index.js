import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { HexColorPicker } from 'react-colorful';

const ColorOptions = ({ onSelectColor, colors, type }) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const colorOptionsRef = useRef(null);

  // Fecha o seletor de cor se o clique for fora do componente
  const handleMouseUp = (event) => {
    if (colorOptionsRef.current && !colorOptionsRef.current.contains(event.target)) {
      setIsPickerVisible(false);
    }
  };

  // Adiciona e remove o event listener para mouseup
  useEffect((event) => {
    console.log(event.target)
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSelectColor = (color, index) => {
    setSelectedColor(color);
    setSelectedOptionIndex(index);
    onSelectColor(color, type);
    // Mantém o seletor aberto após a seleção
    setIsPickerVisible(true);
  };

  const togglePickerVisibility = () => {
    setIsPickerVisible(!isPickerVisible);
  };

  return (
    <div ref={colorOptionsRef}>
      <div className="color-options">
        {colors.map((color, index) => (
          <div
            key={index} // Usando o índice como chave
            className={`color-option ${selectedOptionIndex === index ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handleSelectColor(color, index)}
          ></div>
        ))}
        <div
          className={`color-option ${isPickerVisible ? 'selected' : ''}`}
          style={{ backgroundColor: selectedColor || '#ffffff', color: 'white' }}
          onClick={togglePickerVisibility}
        >
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>?</p>
        </div>
        {isPickerVisible && (
          <div className="hex-color-picker-container">
            <HexColorPicker
              color={selectedColor}
              onChange={(color) => {
                setSelectedColor(color);
                handleSelectColor(color, selectedOptionIndex); // Atualiza a cor selecionada
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ColorSelector = ({ isOpen, onClose, onSelectColor }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const background = [
    'linear-gradient(#98c15c,#80bf4d,#64b231,#1f930f,#107b18)',
    'linear-gradient(#f0a1a0,#b30f15,#96090f,#850606,#63080c)',
    'linear-gradient(#385a7c,#f97171,#f99192,#8ad6cc,#b2eee6)',
    'linear-gradient(#360b19,#673844,#9c6874,#d49ca8,#ffd8e0)',
  ];

  const chatBoxColor = ['#80bf4d', '#96090f', '#f97171', '#673844'];
  const chatBorderColor = ['black', 'white'];

  if (!isOpen) return null;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`sidebarChat ${isSidebarOpen ? 'open' : ''}`}>
      <div>
        <div className="selectBoard">
          <p style={{ color: 'white', fontSize: '12px', backgroundColor: "#0c2e58", borderRadius: "4px" }}>Selecione a cor do fundo:</p>
          <ColorOptions onSelectColor={onSelectColor} colors={background} type="fundo" />
        </div>
        
        <div className="selectBoard">
          <p style={{ color: 'white', fontSize: '12px', backgroundColor: "#0c2e58", borderRadius: "4px" }}>Selecione a cor do chat:</p>
          <ColorOptions onSelectColor={onSelectColor} colors={chatBoxColor} type="chat" />
        </div>
        
        <div className="selectBoard">
          <p style={{ color: 'black', fontSize: '12px', backgroundColor: "#0c2e58", borderRadius: "4px" }}>Selecione a cor das bordas:</p>
          <ColorOptions onSelectColor={onSelectColor} colors={chatBorderColor} type="bordas" />
        </div>
      </div>
    </div>
  );
};

export default ColorSelector;


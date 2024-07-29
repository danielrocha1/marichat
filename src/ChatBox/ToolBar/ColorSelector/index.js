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
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSelectColor = (color, index) => {
    // Atualiza a cor selecionada e o índice
    setSelectedColor(color);
    setSelectedOptionIndex(index);
    // Notifica o pai sobre a cor selecionada, mas não altera o seletor de cores
    onSelectColor(color, type);
  };

  const togglePickerVisibility = () => {
    setIsPickerVisible(!isPickerVisible);
  };

  return (
    <div>
      <div className="color-options">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`color-option ${selectedOptionIndex === index ? 'selected' : ''}`}
            style={{ background: color }}
            onClick={() => {
              setSelectedColor(color);
              setSelectedOptionIndex(index);
              onSelectColor(color, type);
              setHexColorVisible(false); // Definir hexColorVisible como false ao selecionar uma cor sólida
            }}
          ></div>
        ))}
        <div
          className={`color-option ${hexColorVisible ? 'selected' : ''}`} // Aplicar a classe 'selected' se o seletor de cores hexadecimal estiver visível
          style={{ backgroundColor: hexColor, color: "white" }}
          onClick={toggleHexColor}
        >
          <p
            style={{ fontSize: "10px", fontWeight: "bold", color: "white" }}
          >
            ?
          </p>
        </div>
        {hexColorVisible && (
          <div className="hex-color-picker-container">
            <HexColorPicker
              color={selectedColor}
              onChange={color => {
                onSelectColor(color, type);
                setSelectedColor(color);
              setHexColor(color);

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
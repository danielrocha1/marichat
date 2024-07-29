import React, { useState } from 'react';
import './index.css';
import { HexColorPicker } from 'react-colorful';
import ColorOptions from './ColorOptions'; // Presumindo que você extraiu ColorOptions em seu próprio arquivo

const ColorSelector = ({ isOpen, onClose, onSelectColor }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);

  const background = [
    'linear-gradient(#98c15c,#80bf4d,#64b231,#1f930f,#107b18)',
    'linear-gradient(#f0a1a0,#b30f15,#96090f,#850606,#63080c)',
    'linear-gradient(#385a7c,#f97171,#f99192,#8ad6cc,#b2eee6)',
    'linear-gradient(#360b19,#673844,#9c6874,#d49ca8,#ffd8e0)',
  ];

  const chatBoxColor = ['#80bf4d', '#96090f', '#f97171', '#673844'];
  const chatBorderColor = ['black', 'white'];

  // Atualiza o estado de abertura da sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Atualiza a visibilidade da sidebar com base na prop isOpen
  useEffect(() => {
    setIsSidebarOpen(isOpen);
  }, [isOpen]);

  if (!isOpen && !isSidebarOpen) return null; // Retorna null se a sidebar não deve estar visível

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

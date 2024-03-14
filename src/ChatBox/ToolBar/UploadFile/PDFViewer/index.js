import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function PDFViewer({ Message, Hour }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Decodificar o PDF base64
    const decodeBase64PDF = (data) => {
      const matches = data.match(/^data:application\/pdf;base64,(.+)$/);
      if (!matches || matches.length !== 2) {
        throw new Error('Invalid input string');
      }
  
      const base64Data = matches[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
  
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
  
      return URL.createObjectURL(blob);
    };

    const url = decodeBase64PDF(Message);
    setPdfUrl(url);

    return () => {
      // Limpar URL do PDF ao desmontar o componente para evitar memory leaks
      URL.revokeObjectURL(url);
    };
  }, [Message]);

  const timestamp = new Date(Hour);
  const hora = format(timestamp, 'HH:mm');

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  const openPDFInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  if (!pdfUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
      <div style={{ marginBottom: '10px', overflow: 'hidden' }}>
        <embed 
          src={pdfUrl} 
          type="application/pdf" 
          style={{ 
            width: expanded ? '70vw' : '200px', 
            height: expanded ? '100vh' : '250px',
            zIndex: expanded ? '9999' : 'auto', 
            position: expanded ? 'fixed' : 'static', 
            top: '0', 
            left: '0', 
            transition: 'width 0.3s, height 0.3s' 
          }} 
        />
      </div>
      <p style={{ fontSize: '14px', textAlign: 'right', fontWeight: 'bold', margin: '0' }}>{hora}</p>
      <button style={{ fontSize: '12px', marginTop: '5px' }} onClick={expanded ? toggleExpansion : openPDFInNewTab}>
        {expanded ? 'Fechar arquivo' : 'Abrir arquivo'}
      </button>
    </div>
  );
}

export default PDFViewer;

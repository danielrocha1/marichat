import React, { useContext, useState, useRef } from 'react';
import ChatContext from '../../../ChatContext';

function UploadFile({ chat, roomname, id }) {
  const { userData } = useContext(ChatContext);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      try {
        const fileContent = await readFileAsDataURL(file);
        const response = await fetch('https://marichat-go-xtcz.onrender.com/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: "receiver",
            label: "image",
            username: userData.data.username,
            hostid:userData.data.hostid,
            message: fileContent,
            upload: true,
            chatid:chat.chatid,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }

        setUploadStatus('Arquivo enviado com sucesso!');
        // Limpar o valor do input de arquivo
        fileInputRef.current.value = '';
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
        setUploadStatus('Erro ao enviar o arquivo. Por favor, tente novamente.');
      }
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <input
      ref={fileInputRef}
      id={id}
      type="file"
      accept="image/*, .pdf" // Aceita imagens e arquivos PDF
      onChange={handleUpload}
      style={{ display: 'none' }} // Esconde o input
    />
  );
}

export default UploadFile;

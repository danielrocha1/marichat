import React, { useContext } from 'react';
import ChatContext from '../../../ChatContext';

function UploadFile({ id }) {
  const { userData } = useContext(ChatContext);

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      try {
        const fileContent = await readFileAsDataURL(file);

        const response = await fetch('http://localhost:8080/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type:"receiver",
            label: "image",
            username: userData.user,
            roomname: userData.chatroomName,
            message: fileContent,
            upload: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
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
      id={id}
      type="file"
      accept="image/*, .pdf" // Aceita imagens e arquivos PDF
      onChange={handleUpload}
      style={{ display: 'none' }} // Esconde o input
    />
  );
}

export default UploadFile;

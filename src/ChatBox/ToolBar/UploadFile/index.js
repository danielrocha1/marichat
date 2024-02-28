<<<<<<< HEAD
import React, { useContext, useState, useRef } from 'react';
=======
import React, { useContext } from 'react';
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
import ChatContext from '../../../ChatContext';

function UploadFile({ id }) {
  const { userData } = useContext(ChatContext);
<<<<<<< HEAD
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)

  const handleUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      try {
        const fileContent = await readFileAsDataURL(file);
<<<<<<< HEAD
        const response = await fetch('https://marichat-go.onrender.com/upload', {
=======

        const response = await fetch('http://localhost:8080/upload', {
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type:"receiver",
<<<<<<< HEAD
<<<<<<< HEAD
=======
            label: "image",
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
            username: userData.user,
            roomname: userData.chatroomName,
            message: fileContent,
            upload: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao enviar os dados');
        }
<<<<<<< HEAD

        setUploadStatus('Arquivo enviado com sucesso!');
        // Limpar o valor do input de arquivo
        fileInputRef.current.value = '';
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
        setUploadStatus('Erro ao enviar o arquivo. Por favor, tente novamente.');
=======
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error);
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
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
<<<<<<< HEAD
    <div>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*, .pdf" // Aceita imagens e arquivos PDF
        onChange={handleUpload}
        style={{ display: 'none' }} // Esconde o input
      />
      
    </div>
=======
    <input
      id={id}
      type="file"
      accept="image/*, .pdf" // Aceita imagens e arquivos PDF
      onChange={handleUpload}
      style={{ display: 'none' }} // Esconde o input
    />
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
  );
}

export default UploadFile;

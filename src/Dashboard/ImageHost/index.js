import React, { useState } from "react";
import "./index.css"; // Importe o arquivo CSS para estilização

import photo from "./av.png";

const ImageHost = ({ user }) => {
  const [image, setImage] = useState(photo); // Inicializando com null ou uma imagem padrão, se desejar
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    // Aqui você pode adicionar a lógica para fazer o upload da imagem
  };

  return (
    <div className="">
      <div className="image-container">
        {isLoading ? (
          <div className="loading">Carregando...</div>
        ) : image ? (
          <img
            src={image}
            alt="Imagem selecionada"
            className="uploaded-image"
          />
        ) : (
          <div className="no-image">Sem imagem</div>
        )}
        <div className="overlay">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
            id="fileInput" // Adiciona um id para associar ao label
          />
          <label htmlFor="fileInput" className="upload-button">Upload</label> {/* Label associado ao input de arquivo */}
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ImageHost;


// <button
// onClick={uploadImage}
// className="upload-button"
// disabled={isLoading}
// >
// Alterar Imagem
// </button>


// const uploadImage = async () => {
//   if (image) {
//     setIsLoading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append("photo", image);
//     formData.append("hostid", user.data.hostid);

//     try {
//       const response = await fetch("https://marichat-go.onrender.com/upload-photo", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         console.log("Imagem enviada com sucesso!");
//       } else {
//         throw new Error("Falha ao enviar imagem.");
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }
// };
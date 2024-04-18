import React, { useState } from "react";
import "./index.css"; // Importe o arquivo CSS para estilização

import photo from "./av.png";

const ImageHost = ({ user }) => {
  const [image, setImage] = useState(`data:image/png;base64,${user.data.UserPhoto.photo}`);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      readFileAsDataURL(file)
        .then((fileContent) => {
          setImage(file);
          uploadImage(fileContent);
        })
        .catch((error) => {
          setError("Falha ao ler o arquivo.");
        });
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result.split(',')[1]); // Removendo o prefixo 'data:image/png;base64,' e mantendo apenas a base64
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (fileContent) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://marichat-go.onrender.com/upload-photo", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostid: user.data.hostid, photo: fileContent }),
      });

      if (response.ok) {
        console.log("Imagem enviada com sucesso!");
        setImage()
      } else {
        throw new Error("Falha ao enviar imagem.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
            id="fileInput"
          />
          <label htmlFor="fileInput" className="upload-button">Upload</label>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ImageHost;

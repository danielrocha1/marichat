import React, { useState } from "react";
import "./index.css"; // Importe o arquivo CSS para estilização

import photo from "./av.png";

const ImageHost = () => {
  const [image, setImage] = useState(photo);
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

  const uploadImage = async () => {
    if (image) {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("photo", image);

      try {
        const response = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Imagem enviada com sucesso!");
        } else {
          throw new Error("Falha ao enviar imagem.");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
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
          />
          <button
            onClick={uploadImage}
            className="upload-button"
            disabled={isLoading}
          >
            Alterar Imagem
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ImageHost;

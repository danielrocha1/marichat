import React, { useState, useEffect } from "react";
import "./index.css"; // Importe o arquivo CSS para estilização

import photo from "./av.png";

const ImageHost = ({ user }) => {
  const [image, setImage] = useState(photo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(new FormData());

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);

      const newFormData = new FormData();
      newFormData.append("photo", file);
      newFormData.append("hostid", user.data.hostid);
      setFormData(newFormData);
    }
  };

  useEffect(() => {
    const uploadData = async () => {
      if (formData.get("photo")) {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch("https://marichat-go.onrender.com/upload-photo", {
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

    uploadData();
  }, [formData, user.data.hostid]);

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
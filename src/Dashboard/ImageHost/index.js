import React, { useState, useContext } from "react";
import "./index.css";
import ChatContext from "../../ChatContext"


const ImageHost = ({ user }) => {
  const { setUserData} = useContext(ChatContext);

  const photo = `data:image/*;base64,${user.data.UserPhoto.photo}`;
  const [image, setImage] = useState(photo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      readFileAsDataURL(file)
        .then((fileContent) => {
          uploadImage(fileContent);
        })
        .catch(() => {
          setError("Falha ao ler o arquivo.");
        });
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result.split(',')[1]);
      };

      reader.onerror = () => {
        reject(new Error("Falha ao ler o arquivo."));
      };

      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (fileContent) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://marichat-go-xtcz.onrender.com/upload-photo", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostid: user.data.hostid, photo: fileContent }),
      });

      if (response.ok) {
        const updatedImage = `data:image/png;base64,${fileContent}`;
        setImage(updatedImage);
        setUserData({
            ...user,
            data: {
              ...user.data,
              UserPhoto: {
                ...user.data.UserPhoto,
                photo: fileContent,
              },
            },
          })
          console.log('USER',{user}, user)
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
        ) : (
          <img
            src={image}
            alt="Imagem selecionada"
            className="uploaded-image"
            onError={() => setError("Falha ao carregar a imagem")}
          />
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

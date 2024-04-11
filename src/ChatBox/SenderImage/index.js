import React, { useState } from 'react';

import { format } from 'date-fns';
import ImageViewer from 'react-simple-image-viewer';

const SenderImage = ({ imageData, imageName, Hour }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const timestamp = new Date(Hour);
  const hora = format(timestamp, 'HH:mm');



  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const closeImageViewer = () => {
    setCurrentImageIndex(0);
    setViewerOpen(false);
  };

  return (
    <div className='senderImage' style={{ position: 'relative' }}>
      <br/>
      <img
        src={imageData}
        alt={imageName}
        style={{ width: '60%', cursor: 'pointer' }}
        onClick={() => openImageViewer(0)}
      />
      <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold', marginRight: '10px' }}>{hora}</p>

      {expanded && (
        <div style={{ position: 'relative', marginTop: '10px' }}>
          <img
            src={imageData}
            alt={imageName}
            style={{ width: '100%', cursor: 'pointer' }}
            onClick={toggleExpanded}
          />   
        </div>
      )}
      {viewerOpen && (
        <div style={{ display: 'flex' }}>
          <ImageViewer
            src={[imageData]}
            currentIndex={currentImageIndex}
            onClose={closeImageViewer}
          />
        </div>
      )}
    </div>
  );
};

export default SenderImage;

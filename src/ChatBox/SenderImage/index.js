import React from 'react';
import ReactDOM from 'react-dom';
import { format } from 'date-fns';

class SenderImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageData: null,
      expanded: false // Estado para controlar a expansão
    };
  }

  componentDidMount() {
    // Decodificar a imagem base64
    const imageData = this.decodeBase64Image(this.props.imageData);
    this.setState({ imageData });
  }

  decodeBase64Image = (data) => {
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid input string');
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    return {
      type: contentType,
      data: URL.createObjectURL(blob)
    };
  }

  toggleExpanded = (event) => {
    event.preventDefault(); // Evitar o comportamento padrão do link
    this.setState(prevState => ({
      expanded: !prevState.expanded
    }));
  };

  renderExpandedImage() {
    const { imageData } = this.state;
    if (!imageData) {
      return null;
    }

    const timestamp = new Date(this.props.Hour);
    const hora = format(timestamp, 'HH:mm');

    const containerStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      width: '40%',
      maxHeight: '90%',
      overflow: 'auto'
    };

    const imageStyle = {
      width: '80%',
      cursor: 'pointer'
    };

    return (
      <div style={containerStyle}>
        <img
          src={imageData.data}
          alt={this.props.imageName}
          style={imageStyle}
          onClick={this.toggleExpanded}
        />
      </div>
    );
  }

  render() {
    const timestamp = new Date(this.props.Hour);
    const hora = format(timestamp, 'HH:mm');

    const { expanded } = this.state;

    return (
      <div className='senderImage' style={{ position: 'relative' }}>
        <img
          src={this.props.imageData}
          alt={this.props.imageName}
          style={{ width: '80%', cursor: 'pointer' }}
          onClick={this.toggleExpanded}
        />
        {expanded && ReactDOM.createPortal(this.renderExpandedImage(), document.getElementById('chatScreen'))}
        <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold', marginRight: '10px' }}>{hora}</p>
      </div>
    );
  }
}

export default SenderImage;

import React from 'react';
import { format } from 'date-fns';

class ReceiverImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageData: null
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

  render() {
    const timestamp = new Date(this.props.Hour);
    const hora = format(timestamp, 'HH:mm');

    const { imageData } = this.state;
    if (!imageData) {
      return <div>Loading...</div>;
    }
    // Renderizar a imagem
    return (
      <div className='receiverMessage'>
      <p style={{ fontSize: '15px', textAlign: 'left', fontWeight: 'bold' }}>{this.props.Name}:</p>
        <img src={imageData.data} alt={this.props.imageName} style={{ width: '100%' }} />
        <p style={{ fontSize: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hora}</p>
      </div>
    );
  }
}

export default ReceiverImage;

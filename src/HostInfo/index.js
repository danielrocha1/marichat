import './index.css';
import ImageHost from './ImageHost';

function HostInfo(props) {
  return (
    <div className="hostBox" style={{ borderColor: `${props.theme}` }}>
      <p className='nameHost'>{props.name}</p>
      <ImageHost/>
    </div>
  );
}

export default HostInfo;

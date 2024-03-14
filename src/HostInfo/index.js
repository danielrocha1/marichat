import logo from './avataaars.png';
import './index.css';

function HostInfo(props) {
  return (
    <div className="hostBox" style={{ borderColor: `${props.theme}` }}>
      <p className='nameHost'>{props.name}</p>
      {props.name === "Daniel" ? <img src={logo} className="hostPhoto" alt="logo" /> : null}
    </div>
  );
}

export default HostInfo;

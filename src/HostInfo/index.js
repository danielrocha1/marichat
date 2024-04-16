import logo from '../Dashboard/ImageHost/av.png';
import './index.css';
import guest from '../GuestInfo/guestAvatar.png';

function HostInfo(props) {
  return (
    <div className="hostBox" style={{ borderColor: `${props.theme}` }}>
      <p className='nameHost'>{props.name}</p>
      {props.name === "Daniel" ? <img src={logo} className="hostPhoto" alt="logo" /> : <img src={guest} className="hostPhoto" alt="logo" />}
    </div>
  );
}

export default HostInfo;


import './index.css';
import guest from '../GuestInfo/guestAvatar.png';

function HostInfo(props) {
  return (
    <div className="hostBox" style={{ borderColor: `${props.theme}` }}>
      <p className='nameHost'>{props.name}</p>
      <img src={props.photo} className="hostPhoto" alt="logo" /> 
    </div>
  );
}

export default HostInfo;

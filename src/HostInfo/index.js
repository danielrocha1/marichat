
import logo from  './avataaars.png';
import logo2 from '../GuestInfo/guestAvatar.png';
import './index.css'

function HostInfo(props) {
  return (
    <div className="hostBox" style={{borderColor:`${props.theme}`}}>
      
      <p className='nameHost'>{props.name}</p>
        {props.name === "Daniel" ? <img src={logo} className="hostPhoto" alt="logo" /> : <img src={logo2} className="hostPhoto" alt="logo" /> } 
        
        
      
    </div>
  );
}

export default HostInfo;


import logo from  './guestAvatar.png';
import './index.css'

function GuestInfo(props) {
    return (
      <div className="guestBox">
        <img src={logo} className="guestPhoto" alt="logo" />
        <div className="guestInfoContainer">
          <p className="guestName">{props.name}</p>
        
        
    </div>
    </div>
  );
}

export default GuestInfo;

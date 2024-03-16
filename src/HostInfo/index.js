import logo from './avataaars.png';
import './index.css';
<<<<<<< HEAD
=======
import guest from '../GuestInfo/guestAvatar.png';
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548

function HostInfo(props) {
  return (
    <div className="hostBox" style={{ borderColor: `${props.theme}` }}>
      <p className='nameHost'>{props.name}</p>
<<<<<<< HEAD
      {props.name === "Daniel" ? <img src={logo} className="hostPhoto" alt="logo" /> : null}
=======
      {props.name === "Daniel" ? <img src={logo} className="hostPhoto" alt="logo" /> : <img src={guest} className="hostPhoto" alt="logo" />}
>>>>>>> 0a6142cdcebca01a555b5b279085c71d276f6548
    </div>
  );
}

export default HostInfo;

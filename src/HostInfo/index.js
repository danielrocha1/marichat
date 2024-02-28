
import logo from  './avataaars.png';
import logo2 from '../GuestInfo/guestAvatar.png';
import './index.css'

function HostInfo(props) {
  return (
    <div className="hostBox" style={{borderColor:`${props.theme}`}}>
      
      <p className='nameHost'>{props.name}</p>
<<<<<<< HEAD
        {props.name === "Daniel" ? <img src={logo} className="hostPhoto" alt="logo" /> : <img src={logo2} className="hostPhoto" alt="logo" /> } 
=======
        <img src={logo} className="hostPhoto" alt="logo" />  
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
        
        
      
    </div>
  );
}

export default HostInfo;


import logo from  './avataaars.png';
import './index.css'

function HostInfo(props) {
  return (
    <div className="hostBox">
      
      <p>{props.name}</p>
        <img src={logo} className="hostPhoto" alt="logo" />  
        
        
      
    </div>
  );
}

export default HostInfo;

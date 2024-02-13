import './App.css';
import HostInfo from './HostInfo';
import GuestInfo from './GuestInfo';
import ChatBox from './ChatBox'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="Box">
          <div className="flexBox">
            <div className="columnFlexBox">
              <GuestInfo name="Delmar Rocha"/>
              <HostInfo name="Daniel Rocha"/>
            </div>
            <ChatBox/>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;

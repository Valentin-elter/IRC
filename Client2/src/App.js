import React, { useEffect, useState } from "react";
import io from 'socket.io-client';
import './App.css';

const PORT = 'localhost:3001/'
let socket;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [currentThread, setCurrentThread] = useState("");
  const [channelsList, setChannelsList] = useState([]);
  const [temp, setTemp] = useState("");
  let i = 0;

  const connectToChat = () => {
    if (userName !== "") {
      setLoggedIn(true);
      socket.emit("welcome", userName);
      socket.emit('channelsList');
    } else {
      alert("Enter a name first");
    }
  }

  const sendMessage = async () => {

    let data = {
      room: currentThread,
      author: userName,
      msg: message
    }
    await socket.emit("msg", data, (error) => {
      alert(error);
    });
  };

  useEffect( () => { 
    socket = io(PORT, {transports : ['websocket'] });
  }, [PORT]);

  useEffect( () => {
    socket.on("msg", data => {
      setMessageList(oldArray => [...oldArray, data]);
    });
    socket.on("channelsList", data => {
      setChannelsList(oldArray => [...oldArray, {sub: false, name: data}]);
    });
    socket.on("delChannel", data => {
      setChannelsList(oldArray => oldArray.filter(chan => chan.name !== data));
    });
    socket.on("nick", data => {
      setUserName(data);
    });
    socket.on("join", data => {
      setChannelsList(oldArray => [...oldArray.filter(chan => chan.name !== data), {sub: true, name: data}]);
    });
    socket.on("quit", data => {
      setChannelsList(oldArray => [...oldArray.filter(chan => chan.name !== data), {sub: false, name: data}]);
    });
    socket.on("users", data => {
      alert("user connect: " + data);
    });
    socket.on("list", data => {
      alert("Channel available: " + data);
    });
}, []);

  function subToChan(channel) {
    if (channel.sub == false){
      socket.emit("subscribe", channel.name);
      channel.sub = true;
      setTemp({});
    } else {
      socket.emit("unsubscribe", channel.name);
      channel.sub = false;
      setTemp({});
      if (currentThread === channel.name)
        setCurrentThread("");
    }
  }

  function selectChan(channel) {
    setCurrentThread(channel);
  }

  function sNick(inp, box, command) {
    if (inp.value !== "") {
      socket.emit('msg', {room: currentThread, author: userName, msg: command + inp.value}, error => {
        alert(error);
      });
      box.remove();
    }
    if (command.localeCompare("/list ") == 0 && inp.value === "") {
      socket.emit('msg', {room: currentThread, author: userName, msg: "/list"}, error => {
        alert(error);
      });
      box.remove();
    }
  }

  function bNick(texts, command) {
    let check;
    if ((check = document.getElementsByClassName("inpbox")).length > 0) {
      check[0].remove();
      return(null);
    }

    var box = document.createElement("div");
    box.className = "inpbox";

    var text = document.createElement("p");
    text.innerHTML = texts;

    var inp = document.createElement('input');
    inp.setAttribute("type", "text");

    var butt = document.createElement('button');
    butt.innerHTML = "Valid";
    butt.onclick = function(){sNick(inp, box, command)};

    var butt2 = document.createElement('button');
    butt2.innerHTML = "Quit";
    butt2.onclick = function(){box.remove()};

    document.body.appendChild(box);
    box.appendChild(text);
    box.appendChild(inp);
    box.appendChild(butt)
    box.appendChild(butt2)
  }

  function bUsers() {
    socket.emit("msg", {room: currentThread, author: userName, msg: "/users"});
  }

  function writeMsg(val) {
    
    if (val.room === currentThread) {
      i++;
      if (!(val.user === userName)) {
        return (
          <div className="getMessage" key={val.user + i}>
              <span className="timeMessage">{val.time} {val.user + ": "} </span><span className="textMessage">{val.msg}</span>
          </div>
        );
      }
      else {
        return (
          <div className="myMessage" key={val.user + i}>
              <span className="timeMessage">{val.time} {val.user + ": "} </span><span className="textMessage">{val.msg}</span>
          </div>
        );
      }
    }
  else
    return null;
  }

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="logIn">
          <h1>Welcome to IRC !</h1>
          <div className="inputs">
            <input type="text" placeholder="Enter your Name" onChange={(e) => {setUserName(e.target.value)}}/>
          </div>
          <button onClick={connectToChat}>Enter Chat</button>
        </div>
      ) : ( 
        <div className="IRC">
          <div className="settings">
            <div className="subchan">
            { channelsList.map((val, key) => {
                if (val.sub == true)
                return (<button onClick={() => selectChan(val.name)}>{val.name}</button>);
              })}
            </div>
            <div className="chan">
              { channelsList.map((val, key) => {
                return (<button onClick={() => subToChan(val)}>{val.name}</button>);
              })}
              
            </div>
            <div className="actions">
              <button onClick={() => bNick("Enter your new pseudo", "/nick ")}>Nick</button>
              <button onClick={() => bNick("Research channel's name(optionnal)", "/list ")}>List</button>
              <button onClick={() => bNick("Enter channel's name", "/create ")}>Create</button>
              <button onClick={() => bNick("Enter channel's name", "/delete ")}>Delete</button>
              <button onClick={bUsers}>users</button>
            </div>
          </div>
          <div className="chat">
            <div className="thread">
              {messageList.map((val, key) => {
                return (writeMsg(val));
              })}
            </div>
            <div className="threadput">
              <input type="text" className="textinput" placeholder="Write here" onChange={(e) => setMessage(e.target.value)}/>
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
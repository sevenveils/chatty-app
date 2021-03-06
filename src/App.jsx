import React, {Component} from "react";

import ChatBar from "./ChatBar.jsx";
import NavBar from "./NavBar.jsx";
import MessageList from "./MessageList.jsx";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "Anonymous",
      messages: [],
      onlineUsers: 0
    };
  }

  componentDidMount() {
    this.socket = new WebSocket(`ws://${location.hostname}:3001`);
    this.socket.onmessage = (message) => {
      const incomingObj = JSON.parse(message.data);
      switch(incomingObj.type) {
        case "incomingMessage":
        case "incomingNotification":
        this.setState({ messages: this.state.messages.concat(incomingObj) });
        break;
      case "onlineUsers":
        this.setState({ onlineUsers: incomingObj.onlineUsers });
        break;
      }
    };
    this.socket.onopen = function(event) {
      console.log("Connected to Server");
    };
  }
  // Tells the server what kind of message is arriving to tag it as a notification or a mesage
  newNotification(note) {
    const notification = {
      type: "postNotification",
      content: note
    }
    this.socket.send(JSON.stringify(notification));
  }

  setNewUsername = (oldUsername, newUsername) => {
    this.setState({ username: newUsername });
    this.newNotification(`${oldUsername || "Unknown"} changed their username to ${newUsername}`)
  }
  // this is a function to create a new message and send it to the server to be broadcast to all users
  addNewMessage = (content) => {
    const message = {
      username: this.state.username,
      content: content,
      type: "postMessage"
    };
    this.socket.send(JSON.stringify(message));
  }
  // This renders the username, message, any changes to username and the number of online users
  render() {
    return (
      <div className="messagecontainer">
        <NavBar onlineUsers={this.state.onlineUsers} />
        <MessageList messages={this.state.messages} />
        <ChatBar username={this.state.username}
          newUsername={ this.setNewUsername }
          newMessage={ this.addNewMessage }/>
      </div>
    );
  }
}

export default App;

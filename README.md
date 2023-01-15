# IRC
A third-year student project, an Internet Relay Chat client developed using ReactJS and a server built with NodeJS and ExpressJS utilizing Socket.io for real-time communication.

## Features

* The server accept multiple simultaneous connections and implement the notion of channels.
* Possible to join several channels simultaneously.
* Create, rename and delete channels.
* a message is displayed when a user joins or leaves a channel.
* users of course are able to speak in the channels they have joined.
* Channels and messages must be persistently preserved.

## Usage

* __/nick nickname:__ define the nickname of the user on the server.
* __/list [string]:__ list the available channels from the server. If string is specified, only displays those whose name contains the string.
* __/create channel:__ create a channel with the specified name.
* __/delete channel:__ delete the channel with the specified name.
* __/join channel:__ join the specified channel.
* __/quit channel:__ quit the specified channel.
* __/users:__ list the users currently in the channel
* __/msg nickname message:__ send a private the message to the specified nickname.
* __message:__ send message the all the users on the channel

## Build on Linux (Ubuntu)

### 1. Install the dependencies:

	Node.js and React.js

### 2. Start the server

    node server

### 3. Start the client:
	npm run start
 (you can duplicate the page to simulate other users)

## Screenshots

![Alt text](screenshots/1.png?raw=true "1")
![Alt text](screenshots/2.png?raw=true "2")
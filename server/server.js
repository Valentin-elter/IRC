const express = require('express');
const socketio = require('socket.io'); 
const http = require('http');
const path = require('path');
const cors = require('cors');
const toMessage = require('./utils/toMessage');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = socketio(server);

var users = {};
var channels = [];
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

io.on('connection', (socket) => {
    socket.on('welcome', pseudo => {
        users[socket.id] = pseudo;
    });
    socket.on('channelsList', () => {
        channels.forEach(element => {
            socket.emit('channelsList', element);
        })
    });
    socket.on('subscribe', room => {
        socket.join(room);
        io.in(room).emit('msg', toMessage("Server", users[socket.id] + " subscribe to this channel!", room));
    });
    socket.on('unsubscribe', room => {
        socket.leave(room);
        io.in(room).emit('msg', toMessage("Server", users[socket.id] + " unsubscribe to this channel.", room));
    });
    socket.on('disconnect', () => {
        delete users[socket.id];
    });
    socket.on('msg', (data, callback) => {
        if (data.msg.startsWith('/create ')) {
            if (channels.indexOf(data.msg.substring(8)) !== -1)
                callback("channel already exist");
            else {
                callback("channel created: " + data.msg.substring(8));
                channels.push(data.msg.substring(8));
                io.emit('channelsList', data.msg.substring(8));
            }
        } else if (data.msg.startsWith('/delete ')) {
            if (channels.indexOf(data.msg.substring(8)) == -1)
                callback("channel doesn't exist");
            else {
                callback("channel deleted: " + data.msg.substring(8));
                channels.splice(channels.indexOf(data.msg.substring(8)), 1);
                io.emit('delChannel', data.msg.substring(8));
            }
        } else if (data.msg.startsWith('/nick ')) {
            socket.emit('nick', data.msg.substring(6));
            users[socket.id] = data.msg.substring(6);
        } else if (data.msg.startsWith('/join ')) {
            let checks = 0;
            channels.forEach(element => {
                if (element === data.msg.substring(6)) {
                    socket.rooms.forEach(rom => {
                        if (element === rom) {
                            callback("Already sub to this Channel");
                            checks = 1;
                        }
                    })
                    if (checks == 0) {
                        socket.join(element);
                        socket.emit("join", element);
                        callback('succes sub to: ' + element);
                        checks = 1;
                    }
                }
            })
            if (checks == 0)
                callback("this Channel doesn't exist");
        } else if (data.msg.startsWith('/quit ')) {
            let ch = 0;
            channels.forEach(element => {
                if (element === data.msg.substring(6)) {
                    socket.rooms.forEach(rom => {
                        if (element === rom) {
                            callback("succes unsub to: " + element);
                            socket.emit("quit", element);
                            socket.leave(element);
                            ch = 1;
                        }
                    })
                    if (ch == 0) {
                        callback('not sub to ' + element);
                        ch = 1;
                    }
                }
            })
            if (ch == 0)
            callback("this Channel doesn't exist");
        } else if (data.msg.localeCompare('/users') == 0) {
            if (data.room != "") {
                let res = [];
                io.sockets.adapter.rooms.get(data.room).forEach(id => {
                    res.push(users[id]);
                })
                socket.emit('users', res);
            }
        } else if (data.msg.startsWith('/list')) {
            if (data.msg.length == 5) {
                socket.emit('list', channels);
            } else {
                let response = [];
                channels.forEach(element => {
                    if (element.includes(data.msg.substring(6)))
                        response.push(element)
                })
                socket.emit('list', response);
            }
        }
         else {
             if (data.msg !== "" && data.room !== "") {
                io.in(data.room).emit('msg', toMessage(users[socket.id], data.msg, data.room));
                fs.writeFileSync("db/" + data.room, users[socket.id] + ": " + data.msg + "\n", {encoding: "utf-8", flag: "a+"});
             }
        }
    });
});

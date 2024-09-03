// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        socket.to(room).emit('user-joined', socket.id);
    });

    socket.on('offer', (offer, room) => {
        socket.to(room).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, room) => {
        socket.to(room).emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate, room) => {
        socket.to(room).emit('ice-candidate', candidate);
    });

    socket.on('leave', (room) => {
        socket.leave(room);
        socket.to(room).emit('user-left', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// server.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIO = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
require('dotenv').config({path:'./.env.local'});
var newdatabase = process.env.NEWDATABASE==="true";
console.log(newdatabase)
//  newdatabase = false;

app.prepare().then(async () => {
    const server = express();

    const httpServer = http.createServer(server);

    // const io = socketIO(httpServer);


    const io = socketIO(httpServer, {
        cors: {
            origin: "*", // Allow this origin
            methods: ["GET", "POST"], // Allow these methods
            allowedHeaders: ["my-custom-header"], // If needed, add custom headers
            credentials: true // Allow cookies if necessary
        },
        // maxHttpBufferSize: 1e8,
        // pingTimeout: 60000
    });

    const shuttle = require('shuttle-control-usb');

    shuttle.on('connected', (deviceInfo) => {
        console.log('Connected to ' + deviceInfo.name);
    });

    shuttle.on('buttondown', data => {
        io.emit('buttondown1', data);
    });

    shuttle.on('disconnected', data => {
        console.log(data);
    });

    shuttle.on('shuttle', data => {
        io.emit('shuttle1', data);
    });

    shuttle.on('jog-dir', (data1) => {
        io.emit('jog-dir1', data1);
    });

    shuttle.start();


    io.on('connection', (socket) => {
        console.log('Socket Client connected', socket.id);
        socket.on('ServerConnectionStatus', (data) => {
            // console.log('Received from API ::', data);
            io.emit('ServerConnectionStatus2', data);
        });
        socket.emit("newdatabase", newdatabase);

        socket.on('currentStory1', (data) => {
            // console.log(data)
            io.emit('currentStoryBroadcast', data);  // Broadcast to all clients
        });

        //from scroll page in caspar  start
        socket.on('setCurrentStoryNumber', (data) => {
            io.emit('setCurrentStoryNumber2', data);
        });

        socket.on('crossedLines', (data) => {
            io.emit('crossedLines2', data);
        });

        socket.on('storyLines', (data) => {
            io.emit('storyLines2', data);
        });

        socket.on('newPosition', (data) => {
            io.emit('newPosition2', data);
        });



        //from scroll page in caspar End


        //webrtc code starts
        socket.on('offer', (data) => {
            socket.broadcast.emit('offer', data);
        });

        socket.on('answer', (data) => {
            socket.broadcast.emit('answer', data);
        });

        socket.on('candidate', (data) => {
            socket.broadcast.emit('candidate', data);
        });
        //webrtc code ends



        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            socket.removeAllListeners();
            socket.removeAllListeners('ServerConnectionStatus');
            socket.removeAllListeners("connect");
            socket.removeAllListeners("setCurrentStoryNumber");
            socket.removeAllListeners("crossedLines");
            socket.removeAllListeners("storyLines");
            socket.removeAllListeners("newPosition");
            socket.removeAllListeners("currentStory1");
        });

    });

    server.all('*', (req, res) => handle(req, res));

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

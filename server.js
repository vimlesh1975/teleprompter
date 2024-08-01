// server.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIO = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = socketIO(httpServer);
    io.on('connection', (socket) => {
        console.log('Socket Client connected');

        socket.on('ServerConnectionStatus', (data) => {
            // console.log('Received from API ::', data);
            io.emit('ServerConnectionStatus2', data);
        });

        const shuttle = require('shuttle-control-usb');
        shuttle.on('connected', (deviceInfo) => {
            console.log('Connected to ' + deviceInfo.name);
        });
        // Start after 'connect' event listener has been set up
        shuttle.start();
        shuttle.on('buttondown', data => {
            socket.emit('buttondown1', data);
        })
        shuttle.on('disconnected', data => {
            console.log(data)
        })
        shuttle.on('shuttle', data => {
             socket.emit('shuttle1',data)
        })
        // shuttle.on('shuttle-trans', (data1, data2) => {
        //     console.log(data1)
        //     console.log(data2)
        // })
        // shuttle.on('jog', (data1 )=> {
        //     console.log(data1)
        // })

        shuttle.on('jog-dir', (data1) => {
            socket.emit('jog-dir1', data1);
        })
        //shuttleprocode

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
    });

    server.all('*', (req, res) => handle(req, res));

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

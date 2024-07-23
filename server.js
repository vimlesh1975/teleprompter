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
            console.log('Received from API ::', data);
            io.emit('ServerConnectionStatus', data);
        });

        const shuttle = require('shuttle-control-usb');
        shuttle.on('connected', (deviceInfo) => {
            console.log('Connected to ' + deviceInfo.name);
        });
        // Start after 'connect' event listener has been set up
        shuttle.start();
        shuttle.on('buttondown', data => {
            console.log(data)
        })
        shuttle.on('disconnected', data => {
            console.log(data)
        })
        // shuttle.on('shuttle', data => {
        //     console.log(data)
        // })
        shuttle.on('shuttle-trans', (data1, data2) => {
            console.log(data1)
            console.log(data2)
        })
        // shuttle.on('jog', (data1 )=> {
        //     console.log(data1)
        // })

        shuttle.on('jog-dir', (data1) => {
            console.log(data1)
        })
        //shuttleprocode


    });

    server.all('*', (req, res) => handle(req, res));

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

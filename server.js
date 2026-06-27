// server.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIO = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
require('dotenv').config({ path: './.env.local' });
var newdatabase = process.env.NEWDATABASE === "true";

let onlineCount = 0;
let connectedClients = []; // store all sockets

app.prepare().then(async () => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = socketIO(httpServer, {
        cors: {
            origin: "*", // Allow this origin
            methods: ["GET", "POST"], // Allow these methods
            allowedHeaders: ["my-custom-header"], // If needed, add custom headers
            credentials: true // Allow cookies if necessary
        },
    });

    // RF code start---------------
    const HID = require("node-hid");
    const devices = HID.devices();
    const rfDevices = [];
    const rfCandidates = devices.filter((d) => d.usagePage === 12 && d.product !== "ShuttlePRO v2");

    rfCandidates.forEach((deviceInfo) => {
        try {
            const device = new HID.HID(deviceInfo.path);
            rfDevices.push(device);
            device.on("data", (data) => {
                const code = data[1]; // second byte is usually the usage ID
                if (code === 0xe9) {
                    io.emit("speed+", "");
                }
                if (code === 0xea) {
                    io.emit("speed-", "");
                }
            });

            device.on("error", (error) => {
                console.error("RF HID device error:", error.message);
            });
        } catch (error) {
            console.error("Unable to open RF HID device:", {
                manufacturer: deviceInfo.manufacturer,
                product: deviceInfo.product,
                vendorId: deviceInfo.vendorId,
                productId: deviceInfo.productId,
                error: error.message
            });
        }
    });

    // RF code end---------------

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

        const specialId = socket.handshake.query.specialId;
        if (specialId === "browser-abc-123") {
            connectedClients.push(socket.id);
            onlineCount++;
            io.emit('userCount', onlineCount);
        }

        socket.on('disconnectOthers', () => {
            connectedClients.forEach(id => {
                if (specialId === "browser-abc-123") {
                    if (id !== socket.id) {
                        io.sockets.sockets.get(id)?.disconnect(true);
                    }
                }

            });
            connectedClients = [socket.id]; // keep only this one
        });

        socket.on('ServerConnectionStatus', (data) => {
            io.emit('ServerConnectionStatus2', data);
        });
        socket.emit("newdatabase", newdatabase);

        socket.on('currentStory1', (data) => {
            io.emit('currentStoryBroadcast', data);  // Broadcast to all clients
        });

        socket.on('databaseConnection1', (data) => {
            io.emit('databaseConnection', data);  // Broadcast to all clients
        });


        socket.on('currentStoryDropAllow1', (data) => {
            io.emit('currentStoryDropAllow', data);  // Broadcast to all clients
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

        socket.on('allContent', (data) => {
            io.emit('allContent2', data);
        });

        socket.on('setSlugs', (data) => {
            io.emit('setSlugs2', data);
        });

        socket.on('setStartPosition', (data) => {
            io.emit('setStartPosition2', data);
        });

        socket.on('setShowClock', (data) => {
            io.emit('setShowClock2', data);
        });

        socket.on('setNewsReaderText', (data) => {
            io.emit('setNewsReaderText2', data);
        });

        socket.on('rtl', (data) => {
            io.emit('rtl2', data);
        });
        socket.on('fontColor', (data) => {
            io.emit('fontColor2', data);
        });

        socket.on('fontBold', (data) => {
            io.emit('fontBold2', data);
        });

        socket.on('currentFont', (data) => {
            io.emit('currentFont2', data);
        });
        socket.on('scrollContainerStyle', (data) => {
            io.emit('scrollContainerStyle2', data);
        });
        socket.on('scrollingTextStyle', (data) => {
            io.emit('scrollingTextStyle2', data);
        });
        socket.on('speed', (data) => {
            io.emit('speed2', data);
        });
        socket.on('casparready', (data) => {
            io.emit('casparready2', data);
        });

        socket.on('initialisationcomplete', data => {
            io.emit('initialisationcomplete2', data);
        });

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

        //for mobile
        socket.on('speedFromMobile', (data) => {
            io.emit('speedFromMobile2', data);
        });

        socket.on('next', () => {
            io.emit('next2', '');
        });

        socket.on('previous', () => {
            io.emit('previous2', '');
        });

        socket.on('fromStart', data => {
            io.emit('fromStart2', data);
        });

        //end for mbile

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            if (specialId === "browser-abc-123") {
                setTimeout(() => {
                    if (!socket.connected) {
                        onlineCount--;
                        io.emit('userCount', onlineCount);
                    }
                }, 3000); // waits 3 seconds before reducing
            }

            socket.removeAllListeners();
            socket.removeAllListeners('ServerConnectionStatus');
            socket.removeAllListeners("connect");
            socket.removeAllListeners("setCurrentStoryNumber");
            socket.removeAllListeners("crossedLines");
            socket.removeAllListeners("storyLines");
            socket.removeAllListeners("currentStory1");
            socket.removeAllListeners("allContent");
            socket.removeAllListeners("setSlugs");
            socket.removeAllListeners("setStartPosition");
            socket.removeAllListeners("setShowClock");
            socket.removeAllListeners("setNewsReaderText");
            socket.removeAllListeners("fontColor");
            socket.removeAllListeners("rtl");
            socket.removeAllListeners("scrollContainerStyle");
            socket.removeAllListeners("scrollingTextStyle");
            socket.removeAllListeners("casparready");
            socket.removeAllListeners("initialisationcomplete");


            socket.removeAllListeners("speed");
            socket.removeAllListeners("next");
            socket.removeAllListeners("previous");
            socket.removeAllListeners("fromStart");


        });

    });

    server.all('*', (req, res) => handle(req, res));

    const PORT = process.env.PORT || 14000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

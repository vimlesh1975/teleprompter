// socketClient.js
import { io } from 'socket.io-client';

const socketUrl = `http://localhost:${process.env.PORT || 14000}`;

const socket = io(socketUrl, {
    transports: ['polling'],
});

socket.on('connect', () => console.log('Socket connected:', socket.id));
socket.on('disconnect', () => console.log('Socket disconnected'));
socket.on('connect_error', (err) => console.log('Socket connection error:', err));

export default socket;

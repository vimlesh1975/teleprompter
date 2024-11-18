import mysql from 'mysql2/promise';
import { config } from '../db.js';

import io from 'socket.io-client';
// const socket = io('http://localhost:3000');

const socket = io('http://localhost:3000', {
    transports: ['websocket'],
});

socket.on('connect', () => {
    console.log('Socket currentStory connected:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Socket currentStory disconnected');
});

socket.on('connect_error', (err) => {
    console.log('Socket currentStory connection error:', err);
});

export async function POST(req) {
    const { curstory, curbulletin, ScriptID } = await req.json();

    socket.emit('currentStory1', {curstory});

    let connection;

    try {
        const query = `UPDATE currentstory SET curstory = ?, curbulletin = ?, ScriptID = ?`;
        const values = [curstory, curbulletin, ScriptID];
        console.log(values);

        connection = await mysql.createConnection(config);

        try {
            await connection.query(query, values);
            return new Response(JSON.stringify({ message: 'Content updated successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } finally {
            if (connection) {
                await connection.end(); // Close the database connection
            }
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


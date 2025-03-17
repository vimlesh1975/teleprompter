import mysql from 'mysql2/promise';
import { config } from '../db.js';

import socket from '../socketClient.js';
export async function POST(req) {
    const payload = await req.json();
    const { curstory, curbulletin, ScriptID, usedStory } = payload;
  
    var emittedData;
    if (usedStory.length===0){
     emittedData= { curstory, curbulletin, ScriptID:123456789, usedStory }; // Your payload
   }
   else{
        emittedData= { curstory, curbulletin, ScriptID, usedStory }; // Your payload
   }
   
    socket.emit('currentStory1', emittedData);
    // console.log(data)

    let connection;

    try {
        const query = `UPDATE currentstory SET curstory = ?, curbulletin = ?, ScriptID = ?, usedStory = ?`;
        const values = [curstory, curbulletin, ScriptID, JSON.stringify(usedStory)];

        connection = await mysql.createPool(config);

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


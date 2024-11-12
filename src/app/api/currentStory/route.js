import mysql from 'mysql2/promise';
import {config} from '../db.js';

export async function POST(req) {
  let connection;

    try {
        const { curstory, curbulletin , ScriptID} = await req.json();
     
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


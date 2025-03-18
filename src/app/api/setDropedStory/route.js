import mysql from 'mysql2/promise';
import { config } from '../db.js';


export async function POST(req) {
    const payload = await req.json();
    const { dropstory, ScriptID } = payload;
    let connection;
    try {
        const query = `UPDATE script SET dropstory = ? WHERE ScriptID = ?`;
        const values = [dropstory, ScriptID]; 
        connection = await mysql.createPool(config);

        try {
            await connection.query(query, values);
            return new Response(JSON.stringify({ message: `Content updated successfully with ' ${dropstory} ${ ScriptID }` }), {
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


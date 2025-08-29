import mysql from 'mysql2/promise';
import { config, newdatabase } from '../db.js';

export async function POST(req) {
    const payload = await req.json();
    const { ScriptID } = payload;

    let connection;
    try {


        connection = await mysql.createPool(config);

        try {
            const query2 = `UPDATE script SET scriptid_onair = 1 WHERE ScriptID = ?`;
            const values2 = [ScriptID];
            // console.log(actualScriptId);
            if (newdatabase) {
                const [result] = await connection.query(query2, values2);
                // console.log("Rows affected:", result.affectedRows);
            }

            return new Response(JSON.stringify({ message: 'Content inserted/updated successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } finally {
            if (connection) {
                await connection.end();
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

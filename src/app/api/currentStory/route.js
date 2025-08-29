import mysql from 'mysql2/promise';
import { config, newdatabase } from '../db.js';
import socket from '../socketClient.js';

export async function POST(req) {
    const payload = await req.json();
    const { prompterId, curstory, curbulletin, ScriptID, usedStory, selectedDate, actualScriptId } = payload;

    const emittedData = { prompterId, curstory, curbulletin, ScriptID, usedStory, bulletindate: selectedDate, actualScriptId };
    socket.emit('currentStory1', emittedData);
    // console.log(emittedData)

    let connection;
    try {
        const query = newdatabase ? `
            INSERT INTO currentstory (
                prompterId, curstory, curbulletin, ScriptID, usedStory, bulletindate
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                curstory = VALUES(curstory),
                curbulletin = VALUES(curbulletin),
                ScriptID = VALUES(ScriptID),
                usedStory = VALUES(usedStory),
                bulletindate = VALUES(bulletindate)
        `: `
            INSERT INTO currentstory (
                 curstory, curbulletin, ScriptID, curstorymanualro, curtime , curlinetext, curwidth
            ) VALUES ( ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                curstory = VALUES(curstory),
                curbulletin = VALUES(curbulletin),
                ScriptID = VALUES(ScriptID),
                curstorymanualro=VALUES(curstory),
                curtime = VALUES(curtime),
                curlinetext = VALUES(curlinetext),
                curwidth = VALUES(curwidth)
        `;

        let values;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if (newdatabase) {
            values = [
                prompterId,
                curstory,
                curbulletin,
                ScriptID,
                JSON.stringify(usedStory),
                selectedDate

            ];
        } else {
            values = [
                curstory,
                curbulletin,
                ScriptID,
                curstory,
                now,
                '--0-',
                1920

            ];
        }

        // console.log(values);

        connection = await mysql.createPool(config);

        try {
            await connection.query(query, values);
            const query2 = `UPDATE script SET scriptid_onair = 1 WHERE ScriptID = ?`;
            const values2 = [actualScriptId];
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

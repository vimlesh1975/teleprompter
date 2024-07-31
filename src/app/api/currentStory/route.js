import pool from '../db.js'; // Adjust the import based on your actual pool file location

export async function POST(req) {
    try {
        const { curstory, curbulletin } = await req.json();
        const query = `UPDATE currentstory SET curstory = ?, curbulletin = ?`;
        const values = [curstory, curbulletin];
        
        const connection = await pool.getConnection();
        try {
            await connection.query(query, values);
            return new Response(JSON.stringify({ message: 'Content updated successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


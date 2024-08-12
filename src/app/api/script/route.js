import pool from '../db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ScriptID = searchParams.get('ScriptID');

  try {
    const connection = await pool.getConnection();
    try {
      const query = `SELECT Script FROM script WHERE ScriptID = ? LIMIT 1`;
      const [rows] = await connection.query(query, [ScriptID]);
      return new Response(JSON.stringify({ data: rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      connection.release();
      console.log('Connection released form scipt');

    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

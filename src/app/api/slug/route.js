import pool from '../db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const NewsId = searchParams.get('NewsId');
  
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(`CALL show_runorder(?)`, [NewsId]);
      return new Response(JSON.stringify({ data: rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      connection.release();
      // console.log('Connection released form runorders');

    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

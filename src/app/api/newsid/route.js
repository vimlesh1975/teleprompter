import pool from '../db.js';

export async function GET(req) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(`SELECT DISTINCT title FROM newsid WHERE title != '' ORDER BY title ASC`);
      return new Response(JSON.stringify({ data: rows }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

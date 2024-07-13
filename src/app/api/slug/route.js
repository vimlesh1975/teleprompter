import pool from '../db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const param1 = searchParams.get('param1');
  try {
    const [rows] = await pool.query(`CALL show_runorder('${param1}')`);
    return  Response.json({ data: rows[0] })
  } catch (error) {
    return  Response.json({ error: error.message })
  }
}
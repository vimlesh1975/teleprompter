import pool from '../db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ScriptID = searchParams.get('ScriptID');

  try {
    const [rows] = await pool.query(`SELECT Script FROM script where ScriptID='${ScriptID}' LIMIT 1`);
    return  Response.json({ data: rows[0] })
  } catch (error) {
    return  Response.json({ error: error.message })
  }
}
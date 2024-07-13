import pool from '../db.js';

export async function GET(req, res) {
  try {
    const [rows] = await pool.query(`SELECT distinct title FROM newsid where title != '' order by title asc`);
      return  Response.json({ data: rows })
  } catch (error) {
    return  Response.json({ error: error.message })
  }
}
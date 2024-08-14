import pool from '../db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ScriptIDs = searchParams.getAll('ScriptID[]'); // Get all ScriptID values

  if (ScriptIDs.length === 0) {
    return new Response(JSON.stringify({ error: 'No ScriptIDs provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const connection = await pool.getConnection();
    try {
      const placeholders = ScriptIDs.map(() => '?').join(',');
      const query = `SELECT ScriptID, Script FROM script WHERE ScriptID IN (${placeholders})`;
      const [rows] = await connection.query(query, ScriptIDs);

      // Map ScriptIDs to their respective scripts
      const scriptMap = rows.reduce((acc, row) => {
        acc[row.ScriptID] = row.Script;
        return acc;
      }, {});

      // Ensure the response matches the order of ScriptIDs
      const result = ScriptIDs.map(id => ({ ScriptID: id, Script: scriptMap[id] || 'No data' }));

      return new Response(JSON.stringify({ data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

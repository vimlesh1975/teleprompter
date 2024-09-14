import mysql from 'mysql2/promise';
import {config} from '../db.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const NewsId = searchParams.get('NewsId');
  if (NewsId===''){
    return new Response(JSON.stringify({ error: '' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  let connection;
  
  try {
    connection = await mysql.createConnection(config);

    try {
      const [rows] = await connection.query(`CALL show_runorder(?)`, [NewsId]);
      return new Response(JSON.stringify({ data: rows[0] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } finally {
      if (connection) {
        await connection.end(); // Close the database connection
      }

    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

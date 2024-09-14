import mysql from 'mysql2/promise';
import {config} from '../db.js';

export async function GET(req) {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    try {
      const [rows] = await connection.query(`SELECT DISTINCT title FROM newsid WHERE title != '' ORDER BY title ASC`);
      return new Response(JSON.stringify({ data: rows }), {
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

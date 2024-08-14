import mysql from 'mysql2/promise';

var pool=null;
if (pool===null){
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 1,  // You can adjust this based on your needs
    queueLimit: 0,
    idleTimeout: 5000 // 10 seconds
  });
  
}

export default pool;


async function logConnectionMetrics() {
  try {
    const [rows] = await pool.query("SHOW STATUS LIKE 'Threads_connected'");
    const threadsConnected = rows[0].Value;
    console.log(`Current MySQL Connections: ${threadsConnected}`);
  } catch (error) {
    console.error('Error retrieving connection metrics:', error);
  }
}

// Call this function at regular intervals


setInterval(logConnectionMetrics, 5000); // Logs every 5 seconds
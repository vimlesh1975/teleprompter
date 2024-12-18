// import mysql from 'mysql2/promise';

export const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const newdatabase=process.env.NEWDATABASE

// async function logConnectionMetrics() {
//   let connection;
//   try {
//     connection = await mysql.createConnection(config);
//     const [rows] = await connection.query("SHOW STATUS LIKE 'Threads_connected'");
//     const threadsConnected = rows[0].Value;
//     console.log(`Current MySQL Connections: ${threadsConnected}`);
//     if (connection) {
//       await connection.end(); // Close the database connection
//     }
//   }
//   catch (error) {
//     console.error('Error retrieving connection metrics:', error);
//   }
// }
// Call this function at regular intervals

// setInterval(logConnectionMetrics, 5000); // Logs every 5 seconds
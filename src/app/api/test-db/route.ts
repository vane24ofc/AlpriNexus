
// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  console.log('API /api/test-db with MySQL PINGED!');
  
  // Database connection details from environment variables
  const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

  let connection;
  try {
    // Create the connection to database
    connection = await mysql.createConnection(dbConfig);

    // Simple query to verify connection
    const [rows] = await connection.execute('SELECT NOW() as currentTime;');
    
    // Log the result from the database
    // console.log('Query result:', rows); 
    // rows will be an array, e.g., [ { currentTime: 2024-05-28T12:34:56.000Z } ]
    // We need to cast rows to an array of objects with a currentTime property
    const results = rows as { currentTime: Date }[];
    const currentTimeFromServer = results.length > 0 ? results[0].currentTime : 'N/A';

    await connection.end(); // Close the connection

    return NextResponse.json({
      message: 'Successfully connected to MySQL database!',
      currentTimeFromServer: currentTimeFromServer,
      dbHostUsed: dbConfig.host // To confirm which host was attempted
    });

  } catch (error: any) {
    console.error('Error connecting to MySQL or executing query:', error);
    await connection?.end(); // Ensure connection is closed even if an error occurs

    // Return a more detailed error response
    return NextResponse.json(
      { 
        message: 'Failed to connect to MySQL database or execute query.',
        error: error.message,
        errorCode: error.code, // MySQL error code if available
        dbHostAttempted: dbConfig.host
      },
      { status: 500 }
    );
  }
}

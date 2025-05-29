// src/app/api/test-db/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  // Database connection details from environment variables
  const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

  let connection;

  try {
    // Create the connection to database
    connection = await mysql.createConnection(dbConfig);

    // Execute a simple query to test the connection
    const [rows, fields] = await connection.execute('SELECT NOW() as currentTime;');
    
    // If you have a table, you could try selecting from it:
    // const [users] = await connection.execute('SELECT * FROM usuarios LIMIT 1;');

    // Close the connection
    await connection.end();

    return NextResponse.json({ 
      message: 'Successfully connected to MySQL database!',
      // @ts-ignore
      currentTimeFromServer: rows[0]?.currentTime,
      // exampleUsers: users // Uncomment if you test with a table
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error connecting to MySQL or executing query:', error);
    // Ensure the connection is closed even if an error occurs
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing MySQL connection:', closeError);
      }
    }
    return NextResponse.json({ 
      message: 'Failed to connect to MySQL database or execute query.',
      error: error.message,
      details: error.stack // Be cautious about exposing stack traces in production
    }, { status: 500 });
  }
}


// src/app/api/metrics/user-growth-data/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Role } from '@/app/dashboard/layout'; // Import Role type

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

export async function GET(request: NextRequest) {
  const userRole = request.headers.get('x-user-role') as Role | null;

  if (userRole !== 'administrador') {
    return NextResponse.json({ message: 'Acción no autorizada. Se requiere rol de administrador.' }, { status: 403 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Get data for the last 8 months
    // Note: MySQL MONTH() is 1-indexed, YEAR() gives the year.
    // DATE_FORMAT can also be used.
    const query = `
      SELECT 
        YEAR(createdAt) as year, 
        MONTH(createdAt) as month_num, 
        COUNT(*) as users
      FROM users
      WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 8 MONTH) AND status = 'active'
      GROUP BY YEAR(createdAt), MONTH(createdAt)
      ORDER BY year ASC, month_num ASC;
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();

    const results = (rows as any[]).map(row => {
      // Create a date object to easily format month name
      const dateForMonth = new Date(row.year, row.month_num - 1); // month_num is 1-12, Date constructor expects 0-11
      const monthName = format(dateForMonth, 'MMM', { locale: es });
      const yearShort = format(dateForMonth, 'yy');
      return {
        month: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} '${yearShort}`, // e.g., "Ene '24"
        users: Number(row.users),
      };
    });
    
    // Ensure we always return 8 months, even if some have 0 users,
    // by creating a template for the last 8 months and filling it.
    const last8MonthsTemplate: { month: string; users: number }[] = [];
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = format(date, 'MMM', { locale: es });
      const yearShort = format(date, 'yy');
      last8MonthsTemplate.push({
        month: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} '${yearShort}`,
        users: 0,
      });
    }

    // Merge DB results into the template
    const finalData = last8MonthsTemplate.map(templateMonth => {
      const dbResult = results.find(r => r.month === templateMonth.month);
      return dbResult ? dbResult : templateMonth;
    });


    return NextResponse.json(finalData);

  } catch (error: any) {
    console.error('Error fetching user growth data:', error);
    await connection?.end();
    return NextResponse.json(
      { message: 'Failed to fetch user growth data.', error: error.message, code: error.code },
      { status: 500 }
    );
  }
}


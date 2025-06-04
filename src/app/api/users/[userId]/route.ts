
// src/app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

// Database connection details from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Zod schema for validating user updates (passwords are optional)
const updateUserSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).optional(),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  role: z.enum(['administrador', 'instructor', 'estudiante']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  // Password fields are optional. If password is provided, confirmPassword must also be provided and match.
  password: z.string().min(6, "Password must be at least 6 characters.").optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.password && !data.confirmPassword) return false; // if password, confirmPassword is required
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) return false; // if both, they must match
  // If password is provided, it must be min 6 chars (already handled by .min(6) on password field itself)
  return true;
}, {
  message: "Passwords do not match or new password is too short. If not changing password, leave fields blank.",
  path: ["confirmPassword"],
});


// GET handler to fetch a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  if (!userId || isNaN(Number(userId))) {
    return NextResponse.json({ message: 'Invalid user ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Exclude password from being sent to the client
    const [rows] = await connection.execute(
      'SELECT id, fullName, email, role, status, avatarUrl, createdAt, updatedAt FROM users WHERE id = ?',
      [userId]
    );
    await connection.end();

    const users = rows as any[];
    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json(users[0]);
  } catch (error: any) {
    console.error(`Error fetching user ${userId}:`, error);
    await connection?.end();
    return NextResponse.json(
      { message: `Failed to fetch user ${userId}.`, error: error.message },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing user
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  if (!userId || isNaN(Number(userId))) {
    return NextResponse.json({ message: 'Invalid user ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    const body = await request.json();
    
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid user data for update.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, role, status, avatarUrl, password } = validationResult.data;

    // Build the query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: (string | null | undefined)[] = [];

    if (fullName !== undefined) {
      updateFields.push('fullName = ?');
      values.push(fullName);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      values.push(role);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (avatarUrl !== undefined) {
      updateFields.push('avatarUrl = ?');
      values.push(avatarUrl || null);
    }
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
    }

    values.push(userId); // For the WHERE clause

    connection = await mysql.createConnection(dbConfig);
    const query = `UPDATE users SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await connection.execute(query, values);
    await connection.end();

    const updateResult = result as mysql.ResultSetHeader;
    if (updateResult.affectedRows > 0) {
      return NextResponse.json({ message: 'User updated successfully.' });
    } else {
      return NextResponse.json({ message: 'User not found or no changes made.' }, { status: 404 });
    }

  } catch (error: any) {
    await connection?.end();
    console.error(`Error updating user ${userId}:`, error);
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
            { message: 'Failed to update user. Email already exists for another user.', error: error.message },
            { status: 409 } // 409 Conflict
        );
    }
    return NextResponse.json(
      { message: `Failed to update user ${userId}.`, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  if (!userId || isNaN(Number(userId))) {
    return NextResponse.json({ message: 'Invalid user ID provided.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    await connection.end();

    const deleteResult = result as mysql.ResultSetHeader;
    if (deleteResult.affectedRows > 0) {
      return NextResponse.json({ message: 'User deleted successfully.' });
    } else {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
  } catch (error: any) {
    await connection?.end();
    console.error(`Error deleting user ${userId}:`, error);
    // Handle potential foreign key constraint errors if users are linked to other tables
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json(
            { message: 'Cannot delete user. They are referenced in other parts of the system (e.g., courses, enrollments).', error: error.message },
            { status: 409 } // 409 Conflict
        );
    }
    return NextResponse.json(
      { message: `Failed to delete user ${userId}.`, error: error.message },
      { status: 500 }
    );
  }
}

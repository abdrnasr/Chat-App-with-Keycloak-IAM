// app/api/setup/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getErrorMessage, safeEqual } from "@/lib/utils";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {

  // Check if request is has the secret and validate it
  const envSecret = process.env.SEEDING_SECRET;
  if (!envSecret) {
    return NextResponse.json(
      { ok: false, error: "Server is missing SEEDING_SECRET" },
      { status: 500 }
    );
  }
  const provided =
    req.nextUrl.searchParams.get("secret") ||
    req.headers.get("x-seeding-secret");
  

  if (!provided || !safeEqual(provided, envSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Check if database is already seeded
  try{
    const [rows] = await pool.query<[RowDataPacket]>(
      `SELECT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = '${process.env.DATABASE_NAME}'
          AND TABLE_NAME = 'users'
      ) AS users_table_exists;`);  

      const usersTableExists = rows[0]["users_table_exists"];

      if(usersTableExists){
        return NextResponse.json({ ok: true, message: "Database already seeded." }, { status: 200 });
      }
     
    } catch (err:unknown) {
      return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 });
    }

  // Create the database tables
  try {
    // Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        keycloak_id BINARY(16) UNIQUE,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        authorId INT UNSIGNED NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_messages_authorId (authorId),
        CONSTRAINT fk_author FOREIGN KEY (authorId)
          REFERENCES users(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    return NextResponse.json({ ok: true, message: "Tables created!" });
  } catch (err:unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
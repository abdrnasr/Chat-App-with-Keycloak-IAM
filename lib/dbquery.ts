import { RowDataPacket } from "mysql2";
import { pool } from "./db";

export async function getMessagesByUser(userId: number) {
  const [rows] = await pool.query(
    "SELECT id, content FROM messages WHERE authorId = ?",
    [userId] 
  );
  return rows;
}

export interface MessageRow extends RowDataPacket {
  id: number;
  name: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export async function getAllMessages() : Promise<MessageRow[]> {
  const [rows] = await pool.query<MessageRow[]>(
    "SELECT messages.id,users.name, messages.content, messages.createdAt, messages.updatedAt FROM messages INNER JOIN users ON messages.authorId = users.id Order by messages.createdAt"
  );
  return rows;
}

export interface UserId extends RowDataPacket {
  id: number;
}

export async function GetUserPKByUUID(userUUID: string): Promise<number> {
  const [rows] = await pool.query<UserId[]>(
    "SELECT id FROM users WHERE keycloak_id = UUID_TO_BIN(?, 1) LIMIT 1",
    [userUUID]
  );
  return rows.length === 0 ? -1 : rows[0].id;
}

export async function CreateNewUserRecord(userUUID: string,username: string) {

  await pool.query(
    `INSERT INTO users (name, keycloak_id)
    VALUES (?, UUID_TO_BIN(?, 1))
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      keycloak_id = VALUES(keycloak_id)`,
    [username, userUUID]
  );
}

export async function PostMessage(dbID: number, message: string) {
  await pool.query(
    "INSERT INTO messages (content, authorId) VALUES (?, ?)",
    [message, dbID]
  );
}

export async function DeleteMessageById(messageId:number){
  await pool.query("DELETE FROM messages WHERE id = ?", [messageId]);
}

export async function EditMessageById(messageId:number,text:string){
  await pool.query("UPDATE messages SET content = ? WHERE id = ?", [text, messageId]);
}

export async function getUserCount(): Promise<number> {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM users");
  return (rows as RowDataPacket[])[0].count;
}

export async function getMessageCount(): Promise<number> {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM messages");
  return (rows as RowDataPacket[])[0].count;
}


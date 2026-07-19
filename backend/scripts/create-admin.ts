/**
 * One-off script to create the first admin account with username + password.
 *
 * Usage:
 *   pnpm tsx backend/scripts/create-admin.ts
 *
 * Generates a strong random password and stores the bcrypt hash in the
 * "admin-credentials" MongoDB collection. Prints credentials once to stdout.
 *
 * Environment variables (same as main app):
 *   DB_URI, DB_NAME, DB_USERNAME, DB_PASSWORD
 */

import "dotenv/config";
import { MongoClient } from "mongodb";
import crypto from "crypto";
import bcrypt from "bcrypt";

function generatePassword(length = 24): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[(bytes[i] ?? 0) % chars.length];
  }
  return result;
}

async function main(): Promise<void> {
  const { DB_URI, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

  if (DB_URI === undefined || DB_URI === "" || DB_NAME === undefined || DB_NAME === "") {
    console.error("DB_URI and DB_NAME environment variables are required.");
    process.exit(1);
  }

  const auth =
    DB_USERNAME !== undefined && DB_USERNAME !== "" &&
    DB_PASSWORD !== undefined && DB_PASSWORD !== ""
      ? { username: DB_USERNAME, password: DB_PASSWORD }
      : undefined;

  const client = new MongoClient(DB_URI, { auth, connectTimeoutMS: 5000 });
  await client.connect();
  const db = client.db(DB_NAME);

  const adminUsername = "admin";
  const adminPassword = generatePassword();
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existing = await db.collection("admin-credentials").findOne({
    username: adminUsername,
  });

  if (existing !== null) {
    console.log(`Admin account "${adminUsername}" already exists.`);
    console.log("To reset, delete the document from admin-credentials first.");
    await client.close();
    return;
  }

  await db.collection("admin-credentials").insertOne({
    username: adminUsername,
    passwordHash,
    createdAt: Date.now(),
  });

  console.log("========================================");
  console.log("  Admin account created!");
  console.log("========================================");
  console.log(`  Username: ${adminUsername}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("========================================");
  console.log("  SAVE THIS PASSWORD NOW — it will not");
  console.log("  be shown again.");
  console.log("========================================");

  await client.close();
}

void main().catch((err: unknown) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});

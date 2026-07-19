/**
 * One-off script to grant admin privileges to a user.
 *
 * Usage:
 *   pnpm tsx backend/scripts/add-admin.ts <uid>
 *
 * The <uid> is the user's unique ID from the "users" MongoDB collection.
 * To find your uid, query the database:
 *   db.users.findOne({ email: "your@email.com" }, { uid: 1 })
 *
 * Environment variables (same as main app):
 *   DB_URI, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_AUTH_MECHANISM, DB_AUTH_SOURCE
 */

import "dotenv/config";
import { MongoClient } from "mongodb";

const uid = process.argv[2];
if (uid === undefined || uid === "") {
  console.error("Usage: pnpm tsx backend/scripts/add-admin.ts <uid>");
  process.exit(1);
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

  const existing = await db.collection("admin-uids").findOne({ uid });
  if (existing !== null) {
    console.log(`User "${uid}" is already an admin.`);
    await client.close();
    return;
  }

  await db.collection("admin-uids").insertOne({ uid });
  console.log(`Admin privileges granted to user "${uid}".`);
  await client.close();
}

void main().catch((err: unknown) => {
  console.error("Failed to add admin:", err);
  process.exit(1);
});

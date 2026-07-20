import "dotenv/config";
import * as db from "./init/db";
import jobs from "./jobs";
import {
  getLiveConfiguration,
  updateFromConfigurationFile,
} from "./init/configuration";
import app from "./app";
import { Server } from "http";
import { version } from "./version";
import { recordServerVersion } from "./utils/prometheus";
import * as RedisClient from "./init/redis";
import queues from "./queues";
import workers from "./workers";
import Logger from "./utils/logger";
import * as EmailClient from "./init/email-client";
import { init as initFirebaseAdmin } from "./init/firebase-admin";
import { createIndicies as leaderboardDbSetup } from "./dal/leaderboards";
import { createIndicies as blocklistDbSetup } from "./dal/blocklist";
import { createIndicies as connectionsDbSetup } from "./dal/connections";
import { getErrorMessage } from "./utils/error";
import bcrypt from "bcrypt";
import { devGet, devSet } from "./utils/dev-store";
import { isDevEnvironment } from "./utils/misc";

async function seedDefaultAdmin(): Promise<void> {
  const ADMIN_CRED_KEY = "admin_credentials";
  const existing = devGet<Record<string, unknown>>(ADMIN_CRED_KEY);
  if (existing !== null && Object.keys(existing).length > 0) return;
  const hash = await bcrypt.hash("admin123", 10);
  devSet(ADMIN_CRED_KEY, {
    admin: {
      username: "admin",
      passwordHash: hash,
      createdAt: Date.now(),
    },
  });
  Logger.success("Default admin created: admin / admin123");
}

async function bootServer(port: number): Promise<Server> {
  try {
    Logger.info(`Starting server version ${version}`);
    Logger.info(`Starting server in ${process.env["MODE"]} mode`);
    Logger.info(`Connecting to database ${process.env["DB_NAME"]}...`);
    await db.connect();
    const isDbConnected = db.getDb() !== undefined;
    if (isDbConnected) {
      Logger.success("Connected to database");
    }

    Logger.info("Initializing Firebase app instance...");
    initFirebaseAdmin();

    if (isDbConnected) {
      Logger.info("Fetching live configuration...");
      await getLiveConfiguration();
      Logger.success("Live configuration fetched");
    } else {
      Logger.warning("Running without database — using default configuration.");
    }
    await updateFromConfigurationFile();

    Logger.info("Initializing email client...");
    await EmailClient.init();

    Logger.info("Connecting to redis...");
    await RedisClient.connect();

    if (RedisClient.isConnected()) {
      Logger.success("Connected to redis");
      const connection = RedisClient.getConnection();

      Logger.info("Initializing queues...");
      queues.forEach((queue) => {
        queue.init(connection ?? undefined);
      });
      Logger.success(
        `Queues initialized: ${queues
          .map((queue) => queue.queueName)
          .join(", ")}`,
      );

      Logger.info("Initializing workers...");
      workers.forEach(async (worker) => {
        await worker(connection ?? undefined).run();
      });
      Logger.success(
        `Workers initialized: ${workers
          .map((worker) => worker(connection ?? undefined).name)
          .join(", ")}`,
      );
    }

    Logger.info("Starting cron jobs...");
    jobs.forEach((job) => job.start());
    Logger.success("Cron jobs started");

    if (isDbConnected) {
      Logger.info("Setting up leaderboard indicies...");
      await leaderboardDbSetup();

      Logger.info("Setting up blocklist indicies...");
      await blocklistDbSetup();

      Logger.info("Setting up connections indicies...");
      await connectionsDbSetup();
    }

    if (isDevEnvironment()) {
      await seedDefaultAdmin();
    } else {
      try {
        await seedDefaultAdmin();
      } catch {
        Logger.warning("Failed to seed default admin (non-fatal)");
      }
    }

    recordServerVersion(version);
  } catch (error) {
    Logger.error("Failed to boot server");
    const message = getErrorMessage(error);
    Logger.error(message ?? "Unknown error");
    console.error(error);
    return process.exit(1);
  }

  return app.listen(port, "0.0.0.0", () => {
    Logger.success(`API server listening on port ${port}`);
  });
}

const PORT = parseInt(process.env["PORT"] ?? "5005", 10);

void bootServer(PORT);

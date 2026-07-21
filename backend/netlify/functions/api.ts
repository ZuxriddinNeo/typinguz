// @ts-nocheck
import "dotenv/config";
import serverless from "serverless-http";
import buildApp from "../../src/app";
import * as db from "../../src/init/db";
import * as RedisClient from "../../src/init/redis";
import * as EmailClient from "../../src/init/email-client";
import { init as initFirebaseAdmin } from "../../src/init/firebase-admin";
import {
  getLiveConfiguration,
  updateFromConfigurationFile,
} from "../../src/init/configuration";
import { getErrorMessage } from "../../src/utils/error";
import Logger from "../../src/utils/logger";

const app = buildApp();

async function init(): Promise<void> {
  try {
    await db.connect();
    initFirebaseAdmin();
    if (db.getDb() !== undefined) {
      await getLiveConfiguration();
    }
    await updateFromConfigurationFile();
    await EmailClient.init();
    await RedisClient.connect();
  } catch (error) {
    Logger.error("Netlify function initialization failed");
    const msg = getErrorMessage(error);
    if (msg !== undefined && msg !== "") Logger.error(msg);
  }
}

let cachedHandler: ReturnType<typeof serverless> | null = null;

export const handler = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>,
): Promise<unknown> => {
  if (!cachedHandler) {
    await init();
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
};

import { CronJob } from "cron";
import * as db from "../init/db";
import { isDevEnvironment } from "../utils/misc";
import { collection } from "../init/db";
import Logger from "../utils/logger";

const INACTIVITY_DAYS = 14;
const BATCH_SIZE = 100;

async function deleteInactiveUsers(): Promise<void> {
  if (isDevEnvironment()) {
    Logger.info("Skipping inactive user deletion in dev mode");
    return;
  }

  const cutoff = Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

  const users = db.collection("users");
  const results = collection("results");
  const passwords = collection("user-passwords");

  let totalDeleted = 0;

  while (true) {
    const inactive = await users
      .find({
        $or: [
          { lastLoginAt: { $lt: cutoff } },
          { lastLoginAt: { $exists: false }, addedAt: { $lt: cutoff } },
        ],
      })
      .project({ uid: 1, _id: 0 })
      .limit(BATCH_SIZE)
      .toArray();

    if (inactive.length === 0) break;

    const uids = inactive.map((u) => (u as Record<string, unknown>)["uid"] as string);

    await results.deleteMany({ uid: { $in: uids } });
    await passwords.deleteMany({ uid: { $in: uids } });
    await users.deleteMany({ uid: { $in: uids } });

    totalDeleted += uids.length;
    Logger.info(`Deleted ${uids.length} inactive users (total: ${totalDeleted})`);
  }

  if (totalDeleted > 0) {
    Logger.info(`Inactive user cleanup complete: ${totalDeleted} users deleted`);
  }
}

export default new CronJob(
  "0 0 3 * * *",
  deleteInactiveUsers,
  null,
  false,
  "UTC",
);

import crypto from "crypto";
import { TypeUZResponse } from "../../utils/typeuz-response";
import { buildMonkeyMail } from "../../utils/monkey-mail";
import * as UserDAL from "../../dal/user";
import * as ReportDAL from "../../dal/report";
import Logger from "../../utils/logger";
import emailQueue from "../../queues/email-queue";
import { isInitialized as isEmailClientInitialized } from "../../init/email-client";
import {
  AcceptReportsRequest,
  AddCreativeRequest,
  AdminAnalyticsResponse,
  AdminActivityResponse,
  AdminSearchUsersQuery,
  AdminSearchUsersResponse,
  ClearStreakHourOffsetRequest,
  DeleteCreativeParams,
  RejectReportsRequest,
  SendForgotPasswordEmailRequest,
  SendNotificationRequest,
  ToggleBanRequest,
  ToggleBanResponse,
  UpdateAdConfigRequest,
} from "@typeuz/contracts/admin";
import TypeUZError, { getErrorMessage } from "../../utils/error";
import { Configuration } from "@typeuz/schemas/configuration";
import { addImportantLog } from "../../dal/logs";
import { TypeUZRequest } from "../types";
import { isDevEnvironment, getFrontendUrl } from "../../utils/misc";
import { devGet, devSet } from "../../utils/dev-store";
import { collection } from "../../init/db";
import { ObjectId } from "mongodb";

function safeImportantLog(
  event: string,
  msg: Record<string, unknown>,
  uid: string,
): void {
  try {
    void addImportantLog(event, msg, uid);
  } catch (_e: unknown) {
    void _e;
  }
}

async function safeUserDAL<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (_e: unknown) {
    void _e;
    return fallback;
  }
}

export async function test(_req: TypeUZRequest): Promise<TypeUZResponse> {
  return new TypeUZResponse("OK", null);
}

export async function toggleBan(
  req: TypeUZRequest<undefined, ToggleBanRequest>,
): Promise<ToggleBanResponse> {
  const { uid } = req.body;

  try {
    if (isDevEnvironment()) {
      const users = devGet<Array<Record<string, unknown>>>("users") ?? [];
      const idx = users.findIndex((u) => u["uid"] === uid);
      if (idx === -1) throw new TypeUZError(404, "Foydalanuvchi topilmadi");
      const banned = !(users[idx]?.["banned"] as boolean);
      users[idx] = { ...(users[idx] ?? {}), banned };
      devSet("users", users);
      safeImportantLog("user_ban_toggled", { banned }, uid);
      return new TypeUZResponse(`Ban toggled`, { banned });
    }

    const user = await safeUserDAL(
      async () =>
        UserDAL.getPartialUser(uid, "toggle ban", ["banned", "discordId"]),
      { banned: false, discordId: "" },
    );

    await UserDAL.setBanned(uid, !user.banned).catch((_e: unknown) => {
      void _e;
    });
    safeImportantLog("user_ban_toggled", { banned: !user.banned }, uid);

    return new TypeUZResponse(`Ban toggled`, {
      banned: !user.banned,
    });
  } catch (e) {
    throw new TypeUZError(500, `Failed to toggle ban: ${getErrorMessage(e)}`);
  }
}

export async function clearStreakHourOffset(
  req: TypeUZRequest<undefined, ClearStreakHourOffsetRequest>,
): Promise<TypeUZResponse> {
  const { uid } = req.body;

  try {
    if (isDevEnvironment()) {
      const users = devGet<Array<Record<string, unknown>>>("users") ?? [];
      const idx = users.findIndex((u) => u["uid"] === uid);
      if (idx !== -1 && users[idx] !== undefined) {
        users[idx] = { ...(users[idx] ?? {}), streakHourOffset: undefined };
        devSet("users", users);
      }
      safeImportantLog("admin_streak_hour_offset_cleared_by", {}, uid);
      return new TypeUZResponse("Streak hour offset cleared", null);
    }

    await UserDAL.clearStreakHourOffset(uid).catch((_e: unknown) => {
      void _e;
    });
    safeImportantLog("admin_streak_hour_offset_cleared_by", {}, uid);
    return new TypeUZResponse("Streak hour offset cleared", null);
  } catch (e) {
    throw new TypeUZError(
      500,
      `Failed to clear streak hour offset: ${getErrorMessage(e)}`,
    );
  }
}

export async function acceptReports(
  req: TypeUZRequest<undefined, AcceptReportsRequest>,
): Promise<TypeUZResponse> {
  await handleReports(
    req.body.reports.map((it) => ({ ...it })),
    true,
    req.ctx.configuration.users.inbox,
  );
  return new TypeUZResponse("Reports removed and users notified.", null);
}

export async function rejectReports(
  req: TypeUZRequest<undefined, RejectReportsRequest>,
): Promise<TypeUZResponse> {
  await handleReports(
    req.body.reports.map((it) => ({ ...it })),
    false,
    req.ctx.configuration.users.inbox,
  );
  return new TypeUZResponse("Reports removed and users notified.", null);
}

export async function handleReports(
  reports: { reportId: string; reason?: string }[],
  accept: boolean,
  inboxConfig: Configuration["users"]["inbox"],
): Promise<void> {
  const reportIds = reports.map(({ reportId }) => reportId);

  const reportsFromDb = await ReportDAL.getReports(reportIds);
  const reportById = new Map(reportsFromDb.map((it) => [it.id, it]));

  const existingReportIds = new Set(reportsFromDb.map((report) => report.id));
  const missingReportIds = reportIds.filter(
    (reportId) => !existingReportIds.has(reportId),
  );

  if (missingReportIds.length > 0) {
    throw new TypeUZError(
      404,
      `Reports not found for some IDs ${missingReportIds.join(",")}`,
    );
  }

  await ReportDAL.deleteReports(reportIds);

  for (const { reportId, reason } of reports) {
    try {
      const report = reportById.get(reportId);
      if (!report) {
        throw new TypeUZError(404, `Report not found for ID: ${reportId}`);
      }

      let mailBody = "";
      if (accept) {
        mailBody = `Your report regarding ${report.type} ${
          report.contentId
        } (${report.reason.toLowerCase()}) has been approved. Thank you.`;
      } else {
        mailBody = `Sorry, but your report regarding ${report.type} ${
          report.contentId
        } (${report.reason.toLowerCase()}) has been denied. ${
          reason !== undefined ? `\nReason: ${reason}` : ""
        }`;
      }

      const mailSubject = accept ? "Report approved" : "Report denied";
      const mail = buildMonkeyMail({
        subject: mailSubject,
        body: mailBody,
      });
      await UserDAL.addToInbox(report.uid, [mail], inboxConfig);
    } catch (e) {
      if (e instanceof TypeUZError) {
        throw new TypeUZError(e.status, e.message);
      } else {
        throw new TypeUZError(
          500,
          `Error handling reports: ${getErrorMessage(e)}`,
        );
      }
    }
  }
}

export async function getAnalytics(
  _req: TypeUZRequest,
): Promise<AdminAnalyticsResponse> {
  let totalUsers = 0;
  let totalTestsStarted = 0;
  let totalTestsCompleted = 0;
  let totalTimeTyping = 0;
  let activeUsersLast24h = 0;

  if (isDevEnvironment()) {
    const cached = devGet<AdminAnalyticsResponse["data"]>("admin_analytics");
    if (cached !== null) {
      return new TypeUZResponse("Analytics retrieved", cached);
    }
    return new TypeUZResponse("Analytics retrieved", {
      totalUsers: 0,
      totalTestsStarted: 0,
      totalTestsCompleted: 0,
      totalTimeTyping: 0,
      activeUsersLast24h: 0,
    });
  }

  try {
    const [userCount, publicStats, activeUsers] = await Promise.all([
      collection("users").countDocuments(),
      collection<{
        testsStarted: number;
        testsCompleted: number;
        timeTyping: number;
      }>("public").findOne({ _id: "stats" as unknown as ObjectId }),
      collection("users").countDocuments({
        lastLoginAt: { $gte: Date.now() - 24 * 60 * 60 * 1000 },
      }),
    ]);

    totalUsers = userCount;
    totalTestsStarted = publicStats?.testsStarted ?? 0;
    totalTestsCompleted = publicStats?.testsCompleted ?? 0;
    totalTimeTyping = publicStats?.timeTyping ?? 0;
    activeUsersLast24h = activeUsers;
  } catch {
    // Return zeros if DB unavailable
  }

  return new TypeUZResponse("Analytics retrieved", {
    totalUsers,
    totalTestsStarted,
    totalTestsCompleted,
    totalTimeTyping,
    activeUsersLast24h,
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  const local = parts[0];
  const domain = parts[1];
  if (domain === undefined || local === undefined || local === "") return email;
  if (local.length <= 3) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
}

export async function searchUsers(
  req: TypeUZRequest<AdminSearchUsersQuery>,
): Promise<AdminSearchUsersResponse> {
  const { q } = req.query;
  const results: AdminSearchUsersResponse["data"] = [];

  if (isDevEnvironment()) {
    const users = devGet<
      Array<{
        uid: string;
        name: string;
        email: string;
        banned?: boolean;
        addedAt?: number;
        completedTests?: number;
        timeTyping?: number;
      }>
    >("users");
    if (users !== null) {
      const lower = q.toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.uid.toLowerCase().includes(lower) ||
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower),
      );
      return new TypeUZResponse(
        "Users retrieved",
        filtered.map((u) => ({ ...u, email: maskEmail(u.email) })),
      );
    }
    return new TypeUZResponse("Users retrieved", []);
  }

  try {
    const safeQ = escapeRegex(q);
    const users = await collection<{
      uid: string;
      name: string;
      email: string;
      banned?: boolean;
      addedAt?: number;
      completedTests?: number;
      timeTyping?: number;
    }>("users")
      .find(
        {
          $or: [
            { uid: { $regex: safeQ, $options: "i" } },
            { name: { $regex: safeQ, $options: "i" } },
            { email: { $regex: safeQ, $options: "i" } },
          ],
        },
        {
          projection: {
            uid: 1,
            name: 1,
            email: 1,
            banned: 1,
            addedAt: 1,
            completedTests: 1,
            timeTyping: 1,
          },
        },
      )
      .limit(50)
      .toArray();

    results.push(...users.map((u) => ({ ...u, email: maskEmail(u.email) })));
  } catch (e) {
    Logger.error(`searchUsers error: ${getErrorMessage(e)}`);
  }

  return new TypeUZResponse("Users retrieved", results);
}

export async function getActivity(
  _req: TypeUZRequest,
): Promise<AdminActivityResponse> {
  if (isDevEnvironment()) {
    const cached = devGet<AdminActivityResponse["data"]>("admin_activity");
    if (cached !== null) {
      return new TypeUZResponse("Activity retrieved", cached);
    }
    return new TypeUZResponse("Activity retrieved", { data: [] });
  }

  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rawResults = await collection("users")
      .aggregate<Record<string, unknown>>([
        {
          $match: { lastLoginAt: { $gte: sevenDaysAgo } },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $toDate: "$lastLoginAt" },
              },
            },
            tests: { $sum: { $ifNull: ["$completedTests", 0] } },
            users: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 as const } },
        { $limit: 30 },
      ])
      .toArray();

    const data = rawResults.map((r) => ({
      date: r["_id"] as string,
      tests: r["tests"] as number,
      users: r["users"] as number,
    }));

    return new TypeUZResponse("Activity retrieved", { data });
  } catch {
    return new TypeUZResponse("Activity retrieved", { data: [] });
  }
}

export async function sendNotification(
  req: TypeUZRequest<undefined, SendNotificationRequest>,
): Promise<TypeUZResponse> {
  const { uid, subject, body } = req.body;

  try {
    if (isDevEnvironment()) {
      const inbox =
        devGet<
          Array<{
            id: string;
            uid: string;
            subject: string;
            body: string;
            timestamp: number;
            read: boolean;
          }>
        >("admin_notifications") ?? [];
      inbox.push({
        id: new ObjectId().toHexString(),
        uid,
        subject,
        body,
        timestamp: Date.now(),
        read: false,
      });
      devSet("admin_notifications", inbox);
      safeImportantLog("admin_notification_sent", { uid, subject }, uid);
      return new TypeUZResponse("Notification sent", null);
    }

    const mail = buildMonkeyMail({ subject, body });
    const config = { enabled: true, maxMail: 100 };
    await UserDAL.addToInbox(uid, [mail], config).catch((_e: unknown) => {
      void _e;
    });
    safeImportantLog("admin_notification_sent", { uid, subject }, uid);

    return new TypeUZResponse("Notification sent", null);
  } catch (e) {
    throw new TypeUZError(
      500,
      `Failed to send notification: ${getErrorMessage(e)}`,
    );
  }
}

export async function getAdConfig(_req: TypeUZRequest): Promise<
  TypeUZResponse<{
    enabled: boolean;
    masterToggle: boolean;
    slots: Array<{
      slotId: string;
      creativeId?: string;
      imageUrl?: string;
      targetUrl?: string;
      enabled: boolean;
    }>;
    creatives: Array<{
      id: string;
      imageUrl: string;
      targetUrl: string;
      enabled?: boolean;
    }>;
  }>
> {
  if (isDevEnvironment()) {
    const ads = devGet<{
      enabled: boolean;
      masterToggle: boolean;
      slots: Array<{
        slotId: string;
        creativeId?: string;
        imageUrl?: string;
        targetUrl?: string;
        enabled: boolean;
      }>;
      creatives: Array<{
        id: string;
        imageUrl: string;
        targetUrl: string;
        enabled?: boolean;
      }>;
    }>("ad_config");
    if (ads !== null) {
      return new TypeUZResponse("Ad config retrieved", ads);
    }
    const defaultConfig = {
      enabled: false,
      masterToggle: false,
      slots: [] as Array<{
        slotId: string;
        creativeId?: string;
        imageUrl?: string;
        targetUrl?: string;
        enabled: boolean;
      }>,
      creatives: [] as Array<{
        id: string;
        imageUrl: string;
        targetUrl: string;
        enabled?: boolean;
      }>,
    };
    return new TypeUZResponse("Ad config retrieved", defaultConfig);
  }

  try {
    const doc = await collection("configuration").findOne({
      _id: "ads" as unknown as ObjectId,
    });
    if (!doc) {
      return new TypeUZResponse("Ad config retrieved", {
        enabled: false,
        masterToggle: false,
        slots: [],
        creatives: [],
      });
    }
    const ads = doc as unknown as {
      enabled: boolean;
      masterToggle: boolean;
      slots: Array<{
        slotId: string;
        creativeId?: string;
        imageUrl?: string;
        targetUrl?: string;
        enabled: boolean;
      }>;
      creatives: Array<{
        id: string;
        imageUrl: string;
        targetUrl: string;
        enabled?: boolean;
      }>;
    };
    return new TypeUZResponse("Ad config retrieved", ads);
  } catch {
    return new TypeUZResponse("Ad config retrieved", {
      enabled: false,
      masterToggle: false,
      slots: [],
      creatives: [],
    });
  }
}

export async function updateAdConfig(
  req: TypeUZRequest<undefined, UpdateAdConfigRequest>,
): Promise<
  TypeUZResponse<{
    enabled: boolean;
    masterToggle: boolean;
    slots: Array<{
      slotId: string;
      creativeId?: string;
      imageUrl?: string;
      targetUrl?: string;
      enabled: boolean;
    }>;
    creatives: Array<{
      id: string;
      imageUrl: string;
      targetUrl: string;
      enabled?: boolean;
    }>;
  }>
> {
  const config = req.body;

  if (isDevEnvironment()) {
    devSet("ad_config", config);
    safeImportantLog(
      "admin_ad_config_updated",
      {},
      req.ctx.decodedToken?.uid ?? "",
    );
    return new TypeUZResponse("Ad config updated", config);
  }

  try {
    await collection("configuration").replaceOne(
      { _id: "ads" as unknown as ObjectId },
      { _id: "ads" as unknown as ObjectId, ...config },
      { upsert: true },
    );
    safeImportantLog(
      "admin_ad_config_updated",
      {},
      req.ctx.decodedToken?.uid ?? "",
    );
    return new TypeUZResponse("Ad config updated", config);
  } catch {
    throw new TypeUZError(500, "Failed to update ad config");
  }
}

export async function addCreative(
  req: TypeUZRequest<undefined, AddCreativeRequest>,
): Promise<
  TypeUZResponse<{
    id: string;
    imageUrl: string;
    targetUrl: string;
    enabled?: boolean;
  }>
> {
  const { imageUrl, targetUrl } = req.body;
  const newCreative = {
    id: new ObjectId().toHexString(),
    imageUrl,
    targetUrl,
    enabled: true,
  };

  if (isDevEnvironment()) {
    const ads = devGet<{
      enabled: boolean;
      masterToggle: boolean;
      slots: Array<{
        slotId: string;
        creativeId?: string;
        imageUrl?: string;
        targetUrl?: string;
        enabled: boolean;
      }>;
      creatives: Array<{
        id: string;
        imageUrl: string;
        targetUrl: string;
        enabled?: boolean;
      }>;
    }>("ad_config") ?? {
      enabled: false,
      masterToggle: false,
      slots: [],
      creatives: [],
    };
    ads.creatives.push(newCreative);
    devSet("ad_config", ads);
    safeImportantLog(
      "admin_creative_added",
      { id: newCreative.id },
      req.ctx.decodedToken?.uid ?? "",
    );
    return new TypeUZResponse("Creative added", newCreative);
  }

  try {
    await collection("configuration").updateOne(
      { _id: "ads" as unknown as ObjectId },
      {
        $push: { creatives: newCreative } as unknown as Record<string, unknown>,
      },
      { upsert: true },
    );
    safeImportantLog(
      "admin_creative_added",
      { id: newCreative.id },
      req.ctx.decodedToken?.uid ?? "",
    );
    return new TypeUZResponse("Creative added", newCreative);
  } catch {
    throw new TypeUZError(500, "Failed to add creative");
  }
}

export async function deleteCreative(
  req: TypeUZRequest<undefined, undefined, DeleteCreativeParams>,
): Promise<TypeUZResponse> {
  const { id } = req.params;

  if (isDevEnvironment()) {
    const ads = devGet<{
      enabled: boolean;
      masterToggle: boolean;
      slots: Array<{
        slotId: string;
        creativeId?: string;
        imageUrl?: string;
        targetUrl?: string;
        enabled: boolean;
      }>;
      creatives: Array<{
        id: string;
        imageUrl: string;
        targetUrl: string;
        enabled?: boolean;
      }>;
    }>("ad_config");
    if (ads !== null) {
      ads.creatives = ads.creatives.filter((c) => c.id !== id);
      devSet("ad_config", ads);
    }
    safeImportantLog(
      "admin_creative_deleted",
      { id },
      req.ctx.decodedToken?.uid ?? "",
    );
    return new TypeUZResponse("Creative deleted", null);
  }

  try {
    await collection("configuration").updateOne(
      { _id: "ads" as unknown as ObjectId },
      { $pull: { creatives: { id } } as unknown as Record<string, unknown> },
    );
    safeImportantLog(
      "admin_creative_deleted",
      { id },
      req.ctx.decodedToken?.uid ?? "",
    );
    return new TypeUZResponse("Creative deleted", null);
  } catch {
    throw new TypeUZError(500, "Failed to delete creative");
  }
}

export async function sendForgotPasswordEmail(
  req: TypeUZRequest<undefined, SendForgotPasswordEmailRequest>,
): Promise<TypeUZResponse> {
  const { email } = req.body;

  try {
    const user = isDevEnvironment()
      ? ((devGet<Record<string, { uid: string; name: string; email: string }>>(
          "users_by_email",
        ) ?? {})[email.toLowerCase()] ?? null)
      : await UserDAL.findByEmail(email);
    if (!user) {
      return new TypeUZResponse("Parolni tiklash so'rovi qabul qilindi", null);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    if (isDevEnvironment()) {
      const resets =
        devGet<
          Record<string, { uid: string; token: string; expiresAt: number }>
        >("password_resets") ?? {};
      resets[resetToken] = { uid: user.uid, token: resetToken, expiresAt };
      devSet("password_resets", resets);
      Logger.info(
        `[DEV] Password reset for ${email}: ${getFrontendUrl()}/reset-password?token=${resetToken}`,
      );
    } else {
      const resetCollection = collection("password-resets") as unknown as {
        insertOne: (doc: Record<string, unknown>) => Promise<unknown>;
      };
      await resetCollection.insertOne({
        uid: user.uid,
        token: resetToken,
        expiresAt,
      });

      if (isEmailClientInitialized()) {
        await emailQueue.sendForgotPasswordEmail(
          email,
          user.name,
          `${getFrontendUrl()}/reset-password?token=${resetToken}`,
        );
      }
    }

    safeImportantLog(
      "admin_forgot_password_email",
      { email, uid: user.uid },
      req.ctx.decodedToken?.uid ?? "",
    );

    return new TypeUZResponse("Parolni tiklash so'rovi qabul qilindi", null);
  } catch (e) {
    Logger.error(`sendForgotPasswordEmail error: ${getErrorMessage(e)}`);
    return new TypeUZResponse("Parolni tiklash so'rovi qabul qilindi", null);
  }
}

// --- Site Content ---
type SiteContentData = {
  hero: { title: string; subtitle: string; description: string };
  features: Array<{ icon: string; title: string; description: string }>;
  aboutCards: Array<{ icon: string; title: string; description: string }>;
  footer: { brandName: string; tagline: string; telegram: string };
};

const SITE_CONTENT_KEY = "site_content";
const THEME_SETTINGS_KEY = "theme_settings";

const defaultSiteContent: SiteContentData = {
  hero: {
    title: "TypeUZ",
    subtitle: "Tez yozishni o'rganing",
    description:
      "O'zbekistonning birinchi yozuv tezligini o'lchash platformasi. Klaviaturada tez va aniq yozishni o'rganing.",
  },
  features: [
    {
      icon: "fa-tachometer-alt",
      title: "Tezlik",
      description: "Yozuv tezligingizni WPM da o'lchang",
    },
    {
      icon: "fa-chart-line",
      title: "Statistika",
      description: "Batafsil statistika va tahlillar",
    },
    {
      icon: "fa-trophy",
      title: "Reyting",
      description: "Boshqa foydalanuvchilar bilan raqobatlashing",
    },
  ],
  aboutCards: [
    {
      icon: "fa-language",
      title: "Ko'p tilli",
      description: "O'zbek, Rus va Ingliz tillarida yozing",
    },
    {
      icon: "fa-bolt",
      title: "Real vaqt",
      description: "Real vaqt rejimida natijalarni kuzating",
    },
    {
      icon: "fa-mobile-alt",
      title: "Moslashuvchan",
      description: "Barcha qurilmalarda ishlaydi",
    },
  ],
  footer: {
    brandName: "TypeUZ",
    tagline: "O'zbekistonning yozuv tezligi platformasi",
    telegram: "https://t.me/typeuz",
  },
};

function loadSiteContent(dev: boolean): SiteContentData {
  if (dev) {
    return devGet<SiteContentData>(SITE_CONTENT_KEY) ?? defaultSiteContent;
  }
  const doc = devGet<SiteContentData>(SITE_CONTENT_KEY) ?? null;
  return doc ?? defaultSiteContent;
}

function saveSiteContent(dev: boolean, data: SiteContentData): void {
  if (dev) {
    devSet(SITE_CONTENT_KEY, data);
  }
}

export async function getSiteContent(
  _req: TypeUZRequest,
): Promise<TypeUZResponse<SiteContentData>> {
  const content = loadSiteContent(isDevEnvironment());
  return new TypeUZResponse("Site content retrieved", content);
}

export async function updateSiteContent(
  req: TypeUZRequest<undefined, SiteContentData>,
): Promise<TypeUZResponse<SiteContentData>> {
  const data = req.body;
  saveSiteContent(isDevEnvironment(), data);
  return new TypeUZResponse("Site content updated", data);
}

// --- Theme Settings ---
type ThemeSettingsData = {
  accentColor: string;
  isDark?: boolean;
};

const defaultThemeSettings: ThemeSettingsData = {
  accentColor: "#ff5a1f",
  isDark: true,
};

export async function getThemeSettings(
  _req: TypeUZRequest,
): Promise<TypeUZResponse<ThemeSettingsData>> {
  if (isDevEnvironment()) {
    const saved = devGet<ThemeSettingsData>(THEME_SETTINGS_KEY);
    return new TypeUZResponse(
      "Theme settings retrieved",
      saved ?? defaultThemeSettings,
    );
  }
  return new TypeUZResponse("Theme settings retrieved", defaultThemeSettings);
}

export async function updateThemeSettings(
  req: TypeUZRequest<undefined, ThemeSettingsData>,
): Promise<TypeUZResponse<ThemeSettingsData>> {
  const data = req.body;
  if (isDevEnvironment()) {
    devSet(THEME_SETTINGS_KEY, data);
  }
  return new TypeUZResponse("Theme settings updated", data);
}

// --- Login Analytics ---
const LOGIN_LOG_KEY_CTRL = "login_log";

function getLoginLogCtrl(): Array<{ uid: string; timestamp: number }> {
  return (
    devGet<Array<{ uid: string; timestamp: number }>>(LOGIN_LOG_KEY_CTRL) ?? []
  );
}

export async function getSignupsByDay(
  _req: TypeUZRequest,
): Promise<TypeUZResponse<Array<{ date: string; count: number }>>> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const raw = devGet<Array<{ uid: string; addedAt: number }>>("users") ?? [];
  const dayMap = new Map<string, number>();
  for (const u of raw) {
    if (u.addedAt !== undefined && u.addedAt >= thirtyDaysAgo) {
      const d = new Date(u.addedAt).toISOString().slice(0, 10);
      dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    }
  }
  const data = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return new TypeUZResponse("Signups data", data);
}

export async function getLoginsByDay(
  _req: TypeUZRequest,
): Promise<TypeUZResponse<Array<{ date: string; count: number }>>> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const log = getLoginLogCtrl().filter((e) => e.timestamp >= thirtyDaysAgo);
  const dayMap = new Map<string, number>();
  for (const e of log) {
    const d = new Date(e.timestamp).toISOString().slice(0, 10);
    dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
  }
  const data = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return new TypeUZResponse("Logins per day", data);
}

export async function getLoginsByWeek(
  _req: TypeUZRequest,
): Promise<TypeUZResponse<Array<{ week: string; count: number }>>> {
  const twelveWeeksAgo = Date.now() - 84 * 24 * 60 * 60 * 1000;
  const log = getLoginLogCtrl().filter((e) => e.timestamp >= twelveWeeksAgo);
  const weekMap = new Map<string, number>();
  for (const e of log) {
    const d = new Date(e.timestamp);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
  }
  const data = Array.from(weekMap.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
  return new TypeUZResponse("Logins per week", data);
}

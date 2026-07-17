import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { WithId } from "mongodb";
import * as UserDAL from "../../dal/user";
import MonkeyError from "../../utils/error";
import { MonkeyResponse } from "../../utils/monkey-response";
import { signToken } from "../../utils/jwt";
import Logger from "../../utils/logger";
import { collection } from "../../init/db";
import { isDevEnvironment } from "../../utils/misc";
import { devGet, devSet } from "../../utils/dev-store";

const router = Router();

type PwDoc = {
  uid: string;
  passwordHash: string;
  createdAt: number;
};

type UserMeta = {
  uid: string;
  email: string;
  name: string;
};

async function getPwDoc(uid: string): Promise<PwDoc | null> {
  if (isDevEnvironment()) {
    return devGet<PwDoc>(`pw_${uid}`);
  }
  return (await collection("user-passwords").findOne({ uid })) as PwDoc | null;
}

async function savePwDoc(doc: PwDoc): Promise<void> {
  if (isDevEnvironment()) {
    devSet(`pw_${doc.uid}`, doc);
  } else {
    await collection("user-passwords").insertOne(doc as unknown as WithId<PwDoc>);
  }
}

async function findUserByEmail(email: string): Promise<UserMeta | null> {
  if (isDevEnvironment()) {
    const allUsers = devGet<Record<string, UserMeta>>("users_by_email") ?? {};
    return allUsers[email.toLowerCase()] ?? null;
  }
  const user = await UserDAL.findByEmail(email).catch(() => null);
  if (!user) return null;
  return { uid: user.uid, email: user.email, name: user.name };
}

async function findUserByName(name: string): Promise<UserMeta | null> {
  if (isDevEnvironment()) {
    const allByName = devGet<Record<string, UserMeta>>("users_by_name") ?? {};
    return allByName[name.toLowerCase()] ?? null;
  }
  const user = await UserDAL.findByName(name).catch(() => null);
  if (!user) return null;
  return { uid: user.uid, email: user.email, name: user.name };
}

async function saveUserMeta(meta: UserMeta): Promise<void> {
  if (isDevEnvironment()) {
    const allUsers = devGet<Record<string, UserMeta>>("users_by_email") ?? {};
    allUsers[meta.email.toLowerCase()] = meta;
    devSet("users_by_email", allUsers);
    const allByName = devGet<Record<string, UserMeta>>("users_by_name") ?? {};
    allByName[meta.name.toLowerCase()] = meta;
    devSet("users_by_name", allByName);
  }
}

router.post("/email/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, firstName, lastName, captcha, gender, age, avatar } = req.body ?? {};

    if (!email || !password || !name) {
      res.status(400).json(new MonkeyResponse("Email, parol va username majburiy", null));
      return;
    }

    if (password.length < 8) {
      res.status(400).json(new MonkeyResponse("Parol kamida 8 belgidan iborat bo'lishi kerak", null));
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json(new MonkeyResponse("Bu email allaqachon ro'yxatdan o'tgan", null));
      return;
    }

    const uid = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!isDevEnvironment()) {
      await UserDAL.addUser(name, email, uid, gender, age, avatar, firstName, lastName);
    }
    await saveUserMeta({ uid, email, name });
    await savePwDoc({ uid, passwordHash: hashedPassword, createdAt: Date.now() });

    const token = signToken({ uid, email });

    res.status(201).json(
      new MonkeyResponse("Ro'yxatdan o'tish muvaffaqiyatli", {
        uid,
        email,
        name,
        token,
      }),
    );
  } catch (e) {
    Logger.error(`Register error: ${(e as Error).message}`);
    res.status(500).json(new MonkeyResponse("Ro'yxatdan o'tishda xatolik", null));
  }
});

router.post("/email/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json(new MonkeyResponse("Email yoki username va parol majburiy", null));
      return;
    }

    const isEmail = email.includes("@");
    const user = isEmail ? await findUserByEmail(email) : await findUserByName(email);
    if (!user) {
      res.status(401).json(new MonkeyResponse("Email/username yoki parol noto'g'ri", null));
      return;
    }

    const pwDoc = await getPwDoc(user.uid);
    if (!pwDoc) {
      res.status(401).json(new MonkeyResponse("Email/username yoki parol noto'g'ri", null));
      return;
    }

    const match = await bcrypt.compare(password, pwDoc.passwordHash);
    if (!match) {
      res.status(401).json(new MonkeyResponse("Email/username yoki parol noto'g'ri", null));
      return;
    }

    if (!isDevEnvironment()) {
      await UserDAL.updateLastLoginAt(user.uid).catch(() => {});
    }

    const token = signToken({ uid: user.uid, email: user.email });

    res.status(200).json(
      new MonkeyResponse("Kirish muvaffaqiyatli", {
        uid: user.uid,
        email: user.email,
        name: user.name,
        token,
      }),
    );
  } catch (e) {
    Logger.error(`Login error: ${(e as Error).message}`);
    res.status(500).json(new MonkeyResponse("Kirishda xatolik", null));
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken, email, name, firstName, lastName, gender, age, avatar } = req.body ?? {};

    if (!idToken || !email) {
      res.status(400).json(new MonkeyResponse("Google ID token va email majburiy", null));
      return;
    }

    let user = await findUserByEmail(email);

    if (!user) {
      const uid = crypto.randomUUID();
      const username = name ?? email.split("@")[0] ?? `user_${uid.slice(0, 8)}`;

      if (!isDevEnvironment()) {
        await UserDAL.addUser(username, email, uid, gender, age, avatar, firstName, lastName);
      }
      await saveUserMeta({ uid, email, name: username });
      user = await findUserByEmail(email);
    }

    if (!user) {
      res.status(500).json(new MonkeyResponse("Foydalanuvchi yaratishda xatolik", null));
      return;
    }

    const token = signToken({ uid: user.uid, email: user.email });

    if (!isDevEnvironment()) {
      await UserDAL.updateLastLoginAt(user.uid).catch(() => {});
    }

    res.status(200).json(
      new MonkeyResponse("Google orqali kirish muvaffaqiyatli", {
        uid: user.uid,
        email: user.email,
        name: user.name,
        token,
      }),
    );
  } catch (e) {
    Logger.error(`Google auth error: ${(e as Error).message}`);
    res.status(500).json(new MonkeyResponse("Google orqali kirishda xatolik", null));
  }
});

router.post("/github", async (req: Request, res: Response) => {
  try {
    const { code } = req.body ?? {};

    if (!code) {
      res.status(400).json(new MonkeyResponse("GitHub authorization code majburiy", null));
      return;
    }

    const GITHUB_CLIENT_ID = process.env["GITHUB_CLIENT_ID"] ?? "dev";
    const GITHUB_CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"] ?? "dev";

    const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenResp.json()) as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      res.status(401).json(new MonkeyResponse("GitHub token olishda xatolik", null));
      return;
    }

    const userResp = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const ghUser = (await userResp.json()) as { login?: string; email?: string; id?: number };

    const email = ghUser.email ?? `${ghUser.login ?? "gh_user"}@github.dev`;

    let user = await findUserByEmail(email);

    if (!user) {
      const uid = crypto.randomUUID();
      const username = ghUser.login ?? `gh_${uid.slice(0, 8)}`;
      if (!isDevEnvironment()) {
        await UserDAL.addUser(username, email, uid);
      }
      await saveUserMeta({ uid, email, name: username });
      user = await findUserByEmail(email);
    }

    if (!user) {
      res.status(500).json(new MonkeyResponse("Foydalanuvchi yaratishda xatolik", null));
      return;
    }

    const token = signToken({ uid: user.uid, email: user.email });

    if (!isDevEnvironment()) {
      await UserDAL.updateLastLoginAt(user.uid).catch(() => {});
    }

    res.status(200).json(
      new MonkeyResponse("GitHub orqali kirish muvaffaqiyatli", {
        uid: user.uid,
        email: user.email,
        name: user.name,
        token,
      }),
    );
  } catch (e) {
    Logger.error(`GitHub auth error: ${(e as Error).message}`);
    res.status(500).json(new MonkeyResponse("GitHub orqali kirishda xatolik", null));
  }
});

router.get("/github/login", (_req: Request, res: Response) => {
  const clientId = process.env["GITHUB_CLIENT_ID"] ?? "dev";
  const backendUrl = `${_req.protocol}://${_req.hostname}:${process.env["PORT"] ?? "5005"}`;
  const redirectUri = `${backendUrl}/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  res.redirect(url);
});

router.get("/github/callback", async (req: Request, res: Response) => {
  const feUrl = () => `${process.env["FRONTEND_URL"] ?? "http://localhost:3000"}/auth-callback.html`;

  try {
    const { code } = req.query as { code?: string };
    const { error: errorParam } = req.query as { error?: string };

    if (errorParam) {
      res.redirect(`${feUrl()}?auth_error=${errorParam}`);
      return;
    }

    if (!code) {
      res.redirect(`${feUrl()}?auth_error=missing_code`);
      return;
    }

    const GITHUB_CLIENT_ID = process.env["GITHUB_CLIENT_ID"] ?? "dev";
    const GITHUB_CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"] ?? "dev";

    const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
    });

    const tokenData = (await tokenResp.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      res.redirect(`${feUrl()}?auth_error=token_exchange_failed`);
      return;
    }

    const userResp = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const ghUser = (await userResp.json()) as { login?: string; email?: string; id?: number };
    const email = ghUser.email ?? `${ghUser.login ?? "gh_user"}@github.dev`;

    let user = await findUserByEmail(email);
    if (!user) {
      const uid = crypto.randomUUID();
      const username = ghUser.login ?? `gh_${uid.slice(0, 8)}`;
      if (!isDevEnvironment()) {
        await UserDAL.addUser(username, email, uid);
      }
      await saveUserMeta({ uid, email, name: username });
      user = await findUserByEmail(email);
    }

    if (!user) {
      res.redirect(`${feUrl()}?auth_error=user_creation_failed`);
      return;
    }

    const token = signToken({ uid: user.uid, email: user.email });
    res.redirect(`${feUrl()}?auth_token=${token}&auth_uid=${user.uid}&auth_email=${encodeURIComponent(user.email)}&auth_name=${encodeURIComponent(user.name)}`);
  } catch (e) {
    Logger.error(`GitHub callback error: ${(e as Error).message}`);
    res.redirect(`${feUrl()}?auth_error=internal_error`);
  }
});

export default router;

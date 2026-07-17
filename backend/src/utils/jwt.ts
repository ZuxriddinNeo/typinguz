import jwt from "jsonwebtoken";
import MonkeyError from "./error";

const getSecret = (): string => {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new MonkeyError(500, "JWT_SECRET not configured");
  }
  return secret;
};

export type JwtPayload = {
  uid: string;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    throw new MonkeyError(401, "Invalid or expired token");
  }
}

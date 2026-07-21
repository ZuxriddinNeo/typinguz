import jwt from "jsonwebtoken";
import TypeUZError from "./error";

const getSecret = (): string => {
  const secret = process.env["JWT_SECRET"];
  if (secret === undefined || secret === null || secret === "") {
    throw new Error(
      "JWT_SECRET environment variable is not set! Set a strong random secret.",
    );
  }
  return secret;
};

export type JwtPayload = {
  uid: string;
  email: string;
  admin?: boolean;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    throw new TypeUZError(401, "Invalid or expired token");
  }
}

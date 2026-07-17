const TOKEN_KEY = "typeuz_token";
const USER_KEY = "typeuz_user";

export type CustomAuthUser = {
  uid: string;
  email: string;
  name: string;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): CustomAuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as CustomAuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: CustomAuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isCustomAuthAvailable(): boolean {
  return getStoredToken() !== null;
}

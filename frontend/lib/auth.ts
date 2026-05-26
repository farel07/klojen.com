// lib/auth.ts

const REFRESH_TOKEN_KEY = 'refresh_token';

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const saveRefreshToken = (token: string): void =>
  localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const clearRefreshToken = (): void =>
  localStorage.removeItem(REFRESH_TOKEN_KEY);

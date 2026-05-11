function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  API_URL: process.env.API_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  GMAIL_USER: process.env.GMAIL_USER,
  APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "7d",
  PORT: process.env.PORT || "4242",
};

import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  rootDir,
  publicDir: rootDir,
  dataDir: path.join(rootDir, "data"),
  databasePath: path.join(rootDir, "data", "redbook-monitoring.sqlite"),
  authStateDir: path.join(rootDir, "data", "xhs-auth"),
  envPath: path.join(rootDir, ".env"),
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 4173),
};

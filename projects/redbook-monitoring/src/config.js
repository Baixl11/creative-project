import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, "data");

export const config = {
  rootDir,
  publicDir: rootDir,
  dataDir,
  databasePath: path.join(dataDir, "redbook-monitoring.sqlite"),
  authStateDir: path.join(dataDir, "xhs-auth"),
  envPath: path.join(rootDir, ".env"),
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 4173),
  allowRemoteAccess: process.env.ALLOW_REMOTE_ACCESS === "true",
};

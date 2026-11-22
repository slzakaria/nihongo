// Loads .env.dev before starting the Next dev server, so development uses the dev keys while .env stays for production.
import { spawn } from "node:child_process";

process.loadEnvFile(".env.dev");

const child = spawn(
  process.execPath,
  [
    "--use-system-ca",
    "./node_modules/next/dist/bin/next",
    "dev",
    ...process.argv.slice(2),
  ],
  { stdio: "inherit", env: process.env },
);
child.on("exit", (code) => process.exit(code ?? 0));

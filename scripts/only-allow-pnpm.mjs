#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ua = (process.env.npm_config_user_agent || process.env.npm_user_agent || "").toLowerCase();
const execPath = (process.env.npm_execpath || "").toLowerCase();

const isPnpm =
  ua.startsWith("pnpm/") ||
  execPath.includes("/pnpm/") ||
  execPath.endsWith("pnpm.js") ||
  execPath.endsWith("pnpm.cjs");

if (!isPnpm) {
  console.error(
    "\n\x1b[31m[zonecontrol-frontend] PROHIBIDO: este proyecto usa exclusivamente pnpm.\x1b[0m\n" +
    `Detectado npm_execpath=${process.env.npm_execpath || "(vacío)"}\n` +
    "Ejecuta:  \x1b[33mpnpm install\x1b[0m  (no npm install, no yarn install)\n",
  );
  process.exit(1);
}

const lockfile = resolve(process.cwd(), "pnpm-lock.yaml");
if (!existsSync(lockfile)) {
  console.error(
    "\n\x1b[31m[zonecontrol-frontend] Falta pnpm-lock.yaml.\x1b[0m\n" +
    "Este proyecto está versionado con pnpm; no uses npm/yarn para regenerar dependencias.\n",
  );
  process.exit(1);
}
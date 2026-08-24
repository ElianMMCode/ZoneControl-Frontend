// Sube las imágenes de productos y sedes al backend mediante la API de admin.
// Uso: node scripts/seed-images.mjs
// Variables opcionales: ZCBASE, DOWNLOADS, ZC_ADMIN_EMAIL, ZC_ADMIN_PASSWORD
import { readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const BASE = process.env.ZCBASE ?? "http://localhost:8080";
const DOWNLOADS = process.env.DOWNLOADS ?? path.join(os.homedir(), "Downloads");
const EMAIL = process.env.ZC_ADMIN_EMAIL ?? "admin@zonecontrol.com";
const PASSWORD = process.env.ZC_ADMIN_PASSWORD ?? "Admin123!";

const IMAGE_EXT = /^(.*)\.(jpe?g|png|webp)$/i;
const normalize = (s) =>
  s
    .normalize("NFC")
    .replace(/^\uFEFF/, "")
    .replace(/[ \t\r\n]+/g, " ")
    .trim()
    .toLowerCase();

async function request(pathName, { token, ...init } = {}) {
  const headers = { Accept: "application/json", ...(init.headers ?? {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${pathName}`, { ...init, headers });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`${init.method ?? "GET"} ${pathName} -> ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined;
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? res.json() : res.text();
}

async function login() {
  const res = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return res.token;
}

async function uploadImage(token, pathName, filePath, mime, filename) {
  const fd = new FormData();
  const buf = await readFile(filePath);
  fd.append("file", new Blob([buf], { type: mime }), filename);
  return request(pathName, { method: "POST", token, body: fd });
}

function mimeFor(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "jpeg" || ext === "jpg") return "image/jpeg";
  return "application/octet-stream";
}

async function seed() {
  const files = await readdir(DOWNLOADS);
  const index = new Map();
  for (const f of files) {
    const m = f.match(IMAGE_EXT);
    if (!m) continue;
    const base = normalize(m[1]);
    if (!index.has(base)) index.set(base, f);
  }

  const token = await login();
  console.log(`Autenticado como ${EMAIL}`);

  const catalogo = await request("/api/public/catalogo", { token });
  const sedes = await request("/api/public/sedes", { token });

  const plan = [
    { items: catalogo, base: "/api/admin/contenido-publico/productos", type: "producto" },
    { items: sedes, base: "/api/admin/contenido-publico/sedes", type: "sede" },
  ];

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const { items, base, type } of plan) {
    for (const item of items) {
      const file = index.get(normalize(item.name));
      if (!file) {
        console.warn(`[${type}] sin imagen para "${item.name}" (${item.id})`);
        skip++;
        continue;
      }
      const filePath = path.join(DOWNLOADS, file);
      try {
        await uploadImage(token, `${base}/${item.id}/imagen`, filePath, mimeFor(file), file);
        console.log(`[${type}] OK  ${item.name}  <-  ${file}`);
        ok++;
      } catch (e) {
        console.error(`[${type}] FAIL ${item.name} (${item.id}): ${e.message}`);
        fail++;
      }
    }
  }

  console.log(`\nResumen: ${ok} subidas, ${skip} sin coincidencia, ${fail} con error.`);
  if (fail) process.exitCode = 1;
}

seed().catch((e) => {
  console.error("Error fatal:", e.message);
  process.exit(1);
});

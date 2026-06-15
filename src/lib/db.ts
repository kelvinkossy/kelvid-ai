import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data.json");

export interface User { id: string; email: string; passwordHash: string; name: string | null; role: string; creditBalance: number; createdAt: string; }
export interface VideoJob { id: string; userId: string; prompt: string; negativePrompt: string | null; style: string | null; camera: string | null; aspectRatio: string; durationSec: number; status: string; provider: string; providerJobId: string | null; outputUrl: string | null; errorMessage: string | null; sourceImage: string | null; characterId: string | null; likes: number; createdAt: string; updatedAt: string; }
export interface Payment { id: string; userId: string; provider: string; paystackReference: string; amount: number; currency: string; creditsPurchased: number; status: string; createdAt: string; updatedAt: string; }
export interface CharacterProfile { id: string; userId: string; name: string; description: string; imageUrl: string | null; createdAt: string; }
interface DB { users: User[]; jobs: VideoJob[]; payments: Payment[]; characters: CharacterProfile[]; }

const SEED_USERS = [
  { id: "seed1", email: "kelvinkossy03@gmail.com", passwordHash: "$2b$12$LYjeO7.750u6UKr7OYuAiug7mfidFfkJtFRW0reD7.O5G1KoJbT9.", name: "kelvin nnatu", role: "ADMIN", creditBalance: 999999, createdAt: "2026-06-11T20:05:02.338Z" },
  { id: "seed2", email: "kelvin1@gmail.com", passwordHash: "$2b$12$CUYV4hw7cwUKfacrB/HSquuBSC1y3Q9bTRCengfqaGfBUwyfp8.A2", name: "kelvin nnatu", role: "ADMIN", creditBalance: 999999, createdAt: "2026-06-12T23:40:57.589Z" },
];

export const UNLIMITED_USERS = ["kelvin1@gmail.com", "kelvinkossy03@gmail.com"];

function load(): DB {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf-8")); }
  catch {
    const fresh: DB = { users: SEED_USERS.map(u => ({...u})), jobs: [], payments: [], characters: [] };
    try { fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2)); } catch {}
    return fresh;
  }
}

function save(d: DB) { try { fs.writeFileSync(DB_PATH, JSON.stringify(d, null, 2)); } catch {} }
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const db = { load, save, uid };

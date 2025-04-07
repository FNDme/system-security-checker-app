import { app } from "electron";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import path from "path";
import fs from "fs";

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || "your-32-byte-encryption-key-here",
  "utf8"
);
const IV_LENGTH = 16;

const STORAGE_PATH = path.join(app.getPath("userData"), "secure-storage.json");

interface SecureStorage {
  supabaseUrl: string;
  supabaseKey: string;
}

export function encryptData(data: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptData(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function saveSecureData(data: SecureStorage): void {
  const encryptedData = {
    supabaseUrl: encryptData(data.supabaseUrl),
    supabaseKey: encryptData(data.supabaseKey),
  };
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(encryptedData));
}

export function getSecureData(): SecureStorage | null {
  try {
    if (!fs.existsSync(STORAGE_PATH)) {
      return null;
    }
    const encryptedData = JSON.parse(fs.readFileSync(STORAGE_PATH, "utf8"));
    return {
      supabaseUrl: decryptData(encryptedData.supabaseUrl),
      supabaseKey: decryptData(encryptedData.supabaseKey),
    };
  } catch (error) {
    console.error("Error reading secure storage:", error);
    return null;
  }
}

export function removeSecureData(): void {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      fs.unlinkSync(STORAGE_PATH);
    }
  } catch (error) {
    console.error("Error removing secure storage:", error);
  }
}

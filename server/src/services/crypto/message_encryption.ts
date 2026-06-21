import crypto from "crypto";
import { ENV } from "../../config/env";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function loadMasterKey(): Buffer {
  const rawKey = ENV.MESSAGE_ENCRYPTION_KEY;

  if (!rawKey) {
    throw new Error("MESSAGE ENCRYPTION MISSING");
  }
  const key = Buffer.from(rawKey, "base64");
  return key;
}

const ENCRYPTION_KEY = loadMasterKey();

export function encryptMessage(message: string): string {
  const INITIAL_VECTOR = crypto.randomBytes(IV_LENGTH);
  const initial_crypt = crypto.createCipheriv(
    ALGO,
    ENCRYPTION_KEY,
    INITIAL_VECTOR,
  );
  const crypted_message = Buffer.concat([
    initial_crypt.update(message, "utf-8"),
    initial_crypt.final(),
  ]);
  const encrypt_tag = initial_crypt.getAuthTag();
  return [
    INITIAL_VECTOR.toString("base64"),
    encrypt_tag.toString("base64"),
    crypted_message.toString("base64"),
  ].join(":");
}

export function decryptMessage(cryptedMessage: string): string {
  const value = cryptedMessage.split(":");

  if (value.length !== 3) {
    throw new Error("Invalid encrypted Message Format");
  }
  const iv = Buffer.from(value[0], "base64");
  const authTag = Buffer.from(value[1], "base64");
  const crypted = Buffer.from(value[2], "base64");

  const decrypt = crypto.createDecipheriv(ALGO, ENCRYPTION_KEY, iv);
  decrypt.setAuthTag(authTag);
  const cleanMessage: any = Buffer.concat([
    decrypt.update(crypted),
    decrypt.final(),
  ]);
  return cleanMessage.toString("utf8");
}

import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function loadMasterKey(): Buffer {
  const rawKey = process.env.MESSAGE_ENCRYPTION_KEY;

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

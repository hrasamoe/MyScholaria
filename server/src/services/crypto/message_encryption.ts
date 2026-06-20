const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const SEPARATOR = ":";

function loadMasterKey(): Buffer {
  const rawKey = process.env.MESSAGE_ENCRYPTION_KEY;

  if (!rawKey) {
    throw new Error("MESSAGE ENCRYPTION MISSING");
  }
  const key = Buffer.from(rawKey, "base64");
  return key;
}

const algorithm = 'AES-GCM';
const keyUsage: KeyUsage[] = ['encrypt', 'decrypt'];
const hashAlg = 'SHA-256';
const iterations = 100000;

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function importMasterKey(masterKeyBase64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(masterKeyBase64);
  return crypto.subtle.importKey('raw', keyBuffer, algorithm, true, keyUsage);
}

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...salt));
}

export async function hashPassword(password: string, saltBase64: string): Promise<string> {
  const salt = base64ToArrayBuffer(saltBase64);
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iterations, hash: hashAlg }, keyMaterial, { name: 'AES-GCM', length: 256 }, true, keyUsage);
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
}

export async function encrypt(plaintext: string, key: CryptoKey): Promise<{ encryptedData: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await crypto.subtle.encrypt({ name: algorithm, iv: iv }, key, new TextEncoder().encode(plaintext));
  return { encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))), iv: btoa(String.fromCharCode(...iv)) };
}

export async function decrypt(ciphertext: string, ivBase64: string, key: CryptoKey): Promise<string> {
  const iv = base64ToArrayBuffer(ivBase64);
  const cipherBuffer = base64ToArrayBuffer(ciphertext);
  const decryptedBuffer = await crypto.subtle.decrypt({ name: algorithm, iv: iv }, key, cipherBuffer);
  return new TextDecoder().decode(decryptedBuffer);
}
import { generateSalt, hashPassword, encrypt, decrypt, importMasterKey } from '../crypto';
import type { User, Secret } from '../types';

export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  function respond(data: any, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  function respondError(message: string, status = 500) {
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!env.MASTER_KEY) return respondError("Config Error: MASTER_KEY missing", 500);
    if (!env.DB) return respondError("Config Error: DB missing", 500);

    const encryptionKey = await importMasterKey(env.MASTER_KEY);

    // POST /api/register
    if (request.method === "POST" && url.pathname.endsWith("/register")) {
      const body: any = await request.json();
      if (!body.email || !body.password) return respondError("Missing data", 400);

      const salt = await generateSalt();
      const password_hash = await hashPassword(body.password, salt);
      const userId = crypto.randomUUID();

      const result = await env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, salt, wrapped_key) VALUES (?, ?, ?, ?, ?)`
      ).bind(userId, body.email, password_hash, salt, "PHASE_5_KEY").run();

      if (result.success) return respond({ message: "User registered", userId }, 201);
      return respondError("Register failed (User might exist)", 500);
    }

    // POST /api/login
    if (request.method === "POST" && url.pathname.endsWith("/login")) {
      const body: any = await request.json();
      const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(body.email).first() as unknown as User;
      
      if (!user) return respondError("Invalid credentials", 401);

      const inputHash = await hashPassword(body.password, user.salt);
      if (inputHash === user.password_hash) return respond({ message: "Login Successful", userId: user.id }, 200);
      return respondError("Invalid credentials", 401);
    }

    // POST /api/secrets (Add)
    if (request.method === "POST" && url.pathname.endsWith("/secrets")) {
        const body: any = await request.json();
        if (!body.userId || !body.name || !body.secretValue) return respondError("Missing data", 400);

        const { encryptedData, iv } = await encrypt(body.secretValue, encryptionKey);
        const secretId = crypto.randomUUID();

        const result = await env.DB.prepare(
            `INSERT INTO secrets (id, user_id, name, cipher_text, iv) VALUES (?, ?, ?, ?, ?)`
        ).bind(secretId, body.userId, body.name, encryptedData, iv).run();

        if (result.success) return respond({ message: "Secret Saved", secretId }, 201);
        return respondError("Failed to save secret", 500);
    }

    // GET /api/secrets (List)
    if (request.method === "GET" && url.pathname.endsWith("/secrets")) {
        const userId = url.searchParams.get("userId");
        if (!userId) return respondError("Missing userId", 400);

        const { results } = await env.DB.prepare("SELECT * FROM secrets WHERE user_id = ?").bind(userId).all();
        if (!results) return respond([], 200);

        const decryptedSecrets = await Promise.all((results as unknown as Secret[]).map(async (secret: Secret) => {
            try {
                const plainText = await decrypt(secret.cipher_text, secret.iv, encryptionKey);
                return { id: secret.id, name: secret.name, value: plainText };
            } catch (e) { return { id: secret.id, name: secret.name, value: "ERROR" }; }
        }));
        return respond(decryptedSecrets, 200);
    }

    // DELETE /api/secrets (Remove) - NEW!
    if (request.method === "DELETE" && url.pathname.endsWith("/secrets")) {
        const secretId = url.searchParams.get("id");
        const userId = url.searchParams.get("userId");
        
        if (!secretId || !userId) return respondError("Missing ID", 400);

        // Security Check: Ensure the secret belongs to the requesting user before deleting
        const result = await env.DB.prepare(
            "DELETE FROM secrets WHERE id = ? AND user_id = ?"
        ).bind(secretId, userId).run();

        if (result.success) return respond({ message: "Secret Deleted" }, 200);
        return respondError("Failed to delete", 500);
    }

  } catch (err: any) {
    return respondError(err.message, 500);
  }

  return respondError("API Route Not Found", 404);
};
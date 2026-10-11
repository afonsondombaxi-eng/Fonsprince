"use strict";
/* Testes locais: sobe um "Anthropic" falso e um emissor de certificados Firebase falso. Corre com: npm test */
const http = require("http"), crypto = require("crypto"), fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync, spawn } = require("child_process");
const assert = require("assert");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fpai-"));
execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", tmp + "/k.pem", "-out", tmp + "/c.pem", "-subj", "/CN=t", "-days", "2"], { stdio: "ignore" });
const KEY = fs.readFileSync(tmp + "/k.pem", "utf8"), CERT = fs.readFileSync(tmp + "/c.pem", "utf8");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function jwt(over = {}, kid = "k1") {
  const now = Math.floor(Date.now() / 1000);
  const p = { aud: "demo-proj", iss: "https://securetoken.google.com/demo-proj", sub: "user1", iat: now - 5, exp: now + 3600, ...over };
  const head = b64({ alg: "RS256", kid }), body = b64(p);
  const sig = crypto.createSign("RSA-SHA256").update(head + "." + body).sign(KEY).toString("base64url");
  return head + "." + body + "." + sig;
}
let nextModel = null, modelCalls = 0;
const fake = http.createServer((req, res) => {
  const u = req.url;
  if (u === "/certs") { res.setHeader("cache-control", "max-age=300"); return res.end(JSON.stringify({ k1: CERT })); }
  let raw = ""; req.on("data", (c) => (raw += c)); req.on("end", () => {
    modelCalls++;
    const sent = JSON.parse(raw);
    assert.strictEqual(sent.tool_choice.name, "plan_query");
    assert(!/\d+[ .,]?\d*\s?(Kz|\$)/.test(JSON.stringify(sent.messages)), "nenhum valor monetário deve ser enviado");
    if (nextModel === "error") { res.statusCode = 500; return res.end("{}"); }
    res.end(JSON.stringify({ content: [{ type: "tool_use", input: nextModel }] }));
  });
});

async function main() {
  await new Promise((r) => fake.listen(0, r));
  const fp = fake.address().port;
  const PORT = 18000 + Math.floor(Math.random() * 1000);
  const srv = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, PORT, FIREBASE_PROJECT_ID: "demo-proj", ALLOWED_ORIGINS: "https://app.test", ANTHROPIC_API_KEY: "sk-test", UPSTREAM_URL: `http://127.0.0.1:${fp}/v1/messages`, CERTS_URL: `http://127.0.0.1:${fp}/certs`, RATE_PER_HOUR: "6" },
    stdio: "ignore",
  });
  await new Promise((r) => setTimeout(r, 600));
  const call = (body, { auth = jwt(), origin = "https://app.test" } = {}) =>
    fetch(`http://127.0.0.1:${PORT}/api/plan`, { method: "POST", headers: { "content-type": "application/json", origin, ...(auth ? { authorization: "Bearer " + auth } : {}) }, body: JSON.stringify(body) });
  const q = { question: "quanto gastei em comida no mês passado?", categories: ["Alimentação", "Transporte"], month: "2026-10", today: "2026-10-11", lang: "pt" };
  let pass = 0; const ok = (n) => { pass++; console.log("✔", n); };
  try {
    nextModel = { understood: true, kind: "despesa", intent: "total", from: "2026-09-01", to: "2026-09-30", label: "setembro", category: "Alimentaçao", term: null, limit: 3 };
    let r = await call(q); let j = await r.json();
    assert.strictEqual(r.status, 200); assert.strictEqual(j.plan.category, null); ok("plano válido; categoria inventada é descartada");
    nextModel.category = "Alimentação";
    j = await (await call(q)).json(); assert.strictEqual(j.plan.category, "Alimentação"); ok("categoria exata é aceite");
    nextModel = { understood: true, kind: "despesa", intent: "total", from: "2026-09-31x", to: "2026-09-30", label: "x" };
    r = await call(q); assert.strictEqual(r.status, 502); ok("datas inválidas → 502");
    nextModel = { understood: false }; j = await (await call(q)).json(); assert.strictEqual(j.plan.understood, false); ok("pergunta fora de âmbito");
    nextModel = { understood: true, kind: "despesa", intent: "compare", from: "2026-10-01", to: "2026-10-31", label: "este mês", compare_from: "bad", compare_to: "bad" };
    j = await (await call(q)).json(); assert.strictEqual(j.plan.intent, "total"); ok("comparação sem datas válidas degrada para total");
    r = await call(q, { auth: null }); assert.strictEqual(r.status, 401); ok("sem token → 401");
    r = await call(q, { auth: jwt({ aud: "outro" }) }); assert.strictEqual(r.status, 401); ok("token de outro projeto → 401");
    r = await call(q, { auth: jwt({ exp: 1 }) }); assert.strictEqual(r.status, 401); ok("token expirado → 401");
    r = await call(q, { auth: jwt().slice(0, -4) + "AAAA" }); assert.strictEqual(r.status, 401); ok("assinatura adulterada → 401");
    r = await call(q, { origin: "https://evil.test" }); assert.strictEqual(r.status, 403); ok("origem não autorizada → 403");
    const before = modelCalls;
    r = await call({ ...q, question: "x" }); assert.strictEqual(r.status, 400); assert.strictEqual(modelCalls, before); ok("pergunta vazia não chega à IA");
    nextModel = "error"; r = await call(q, { auth: jwt({ sub: "user2" }) }); assert.strictEqual(r.status, 502); ok("falha da IA → 502 (a app usa o modo básico)");
    nextModel = { understood: true, kind: "despesa", intent: "total", from: "2026-10-01", to: "2026-10-31", label: "x" };
    let last; for (let i = 0; i < 7; i++) last = await call(q, { auth: jwt({ sub: "user3" }) });
    assert.strictEqual(last.status, 429); ok("limite por hora → 429");
    console.log(`\n${pass} testes passaram`);
  } finally { srv.kill(); fake.close(); }
}
main().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });

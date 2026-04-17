import test, { after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.HTTPS_ENFORCED = "false";
process.env.AUTH_MODE = "token";
process.env.BEARER_TOKEN = "contract-test-token";
process.env.ENABLE_AUDIT_LOGS = "false";
process.env.TRUST_PROXY = "false";

const { createApp } = await import("../src/app.js");
const { pool } = await import("../src/db/client.js");
const app = createApp();

after(async () => {
  await pool.end();
});

test("GET /health returns expected contract", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("GET /api/v1/auth/configuration returns auth contract", async () => {
  const response = await request(app).get("/api/v1/auth/configuration");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.auth_mode, "token");
  assert.equal(response.body.token_enabled, true);
  assert.equal(response.body.token_scheme, "Bearer");
  assert.equal(typeof response.body.token_rotation, "object");
});

test("POST /api/v1/visitors/register returns validation contract", async () => {
  const response = await request(app)
    .post("/api/v1/visitors/register")
    .set("Authorization", "Bearer contract-test-token")
    .send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error_code, "VALIDATION_ERROR");
  assert.equal(typeof response.body.message, "string");
  assert.equal(typeof response.body.timestamp, "string");
});

test("POST /api/v1/visitors/register rejects invalid auth token", async () => {
  const response = await request(app)
    .post("/api/v1/visitors/register")
    .set("Authorization", "Bearer invalid-token")
    .send({});

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error_code, "INVALID_TOKEN");
  assert.equal(typeof response.body.timestamp, "string");
});

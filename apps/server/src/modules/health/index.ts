import { Elysia } from "elysia";

export const health = new Elysia({ prefix: "/health" }).get("/", () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

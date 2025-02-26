import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";

import router from "./tasks.index";
import createApp, { createTestApp } from "../../lib/create-app";
import { testClient } from 'hono/testing'
import env from "@/utility/env";
import { execSync } from "node:child_process";
import fs from "node:fs";


if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
};

describe("Task List", () => {
  beforeAll(async () => {
    execSync("bun drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  it("responds with an array", async() =>{
    const testRouter = createTestApp(router);
    const responds = await testRouter.request("/api/tasks");
    const result = await responds.json();
    console.log(result);
    // @ts-expect-error
    expectTypeOf(result).toBeArray();
  });

  it("responds with an array again", async() =>{
    const client = testClient(createApp().route("/",router));
    const response = await client.api.tasks.$get();
    const json = await response.json();

    expectTypeOf(json).toBeArray();
  });
});
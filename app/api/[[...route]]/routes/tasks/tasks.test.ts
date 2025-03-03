/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ZodIssueCode } from "zod";


import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/utility/constants";
import createApp from "../../lib/create-app";

import router from "./tasks.index";
import env from "@/utility/env";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));

describe("tasks routes", () => {
  beforeAll(async () => {
    execSync("bun drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  it("post /tasks validates the body when creating", async () => {
    const response = await client.api.tasks.$post({
      // @ts-expect-error
      json: {
        done: false,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  const id = 1;
  const name = "Learn vitest";
  const order = 0;

  it("post /tasks creates a task", async () => {
    const response = await client.api.tasks.$post({
      json: {
        name,
        done: false,
        order
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
      expect(json.order).toBe(order);
    }
  });

  it("get /tasks lists all tasks", async () => {
    const response = await client.api.tasks.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBe(1);
    }
  });

  it("get /tasks/{id} validates the id param", async () => {
    const response = await client.api.tasks[":id"].$get({
      param: {
        // @ts-expect-error
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("get /tasks/{id} returns 404 when task not found", async () => {
    const response = await client.api.tasks[":id"].$get({
      param: {
        id: 999,
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("get /tasks/{id} gets a single task", async () => {
    const response = await client.api.tasks[":id"].$get({
      param: {
        id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
      expect(json.order).toBe(order);
    }
  });

  it("patch /tasks/{id} validates the body when updating", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        id,
        name: "",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
    }
  });

  it("patch /tasks/{id} validates the id param", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        // @ts-expect-error
        id: "wat",
      },
      json: {
        id
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("patch /tasks/{id} validates the order param", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        id,
        // @ts-expect-error
        order: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("order");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER_1);
    }
  });

  it("patch /tasks/{id} validates empty body", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        id,
      },
      // @ts-expect-error
      json: {
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].code).toBe(ZOD_ERROR_CODES.INVALID_TYPE);
    }
  });

  it("patch /tasks/{id} validates empty body with id", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        id,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].code).toBe(ZOD_ERROR_CODES.INVALID_UPDATES);
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.NO_UPDATES);
    }
  });

  it("patch /tasks/{id} updates a single property (done) of a task", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        id,
        done: true,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.done).toBe(true);
    }
  });

  it("patch /tasks/{id} updates a single property (order) of a task", async () => {
    const response = await client.api.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        id,
        order: 999,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.order).toBe(999);
    }
  });

  it("delete /tasks/{id} validates the id when deleting", async () => {
    const response = await client.api.tasks[":id"].$delete({
      param: {
        // @ts-expect-error
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("delete /tasks/{id} removes a task", async () => {
    const response = await client.api.tasks[":id"].$delete({
      param: {
        id,
      },
    });
    expect(response.status).toBe(204);
  });
});
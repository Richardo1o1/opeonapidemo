import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { insertTasksSchema, patchTasksSchema, selectTasksSchema } from "@/db/schema";
import { createErrorSchema  } from "stoker/openapi/schemas";
import { notFoundSchema, IdParamsSchema, badRequestSchema } from "@/utility/constants";

export const list = createRoute({
  tags: ["Tasks"],
  path: "/tasks",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectTasksSchema),
      "The list of tasks",
    ),
  },
});

export const getById = createRoute({
  tags: ["Tasks"],
  path: "/tasks/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The requested task which matches the id",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "The task was not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const create = createRoute({
  tags: ["Tasks"],
  path: "/tasks",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertTasksSchema,
      "The task to create",
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The created task",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTasksSchema),
      "The validation error",
    ),
  },
});

export const patch = createRoute({
  tags: ["Tasks"],
  path: "/tasks/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchTasksSchema,
      "The task to be changed",
    )
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The changed task",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "The task id was not found",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Update data is empty",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema)
        .or(createErrorSchema(patchTasksSchema)),
      "The validation errors",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetByIdRoute = typeof getById;
export type PatchRoute = typeof patch;



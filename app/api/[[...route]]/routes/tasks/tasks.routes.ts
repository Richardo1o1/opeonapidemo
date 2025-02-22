import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { selectTasksSchema } from "@/db/schema";

export const list = createRoute({
  tags: ["Tasks"],
  path: "/tasks",
  method: "get",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectTasksSchema),
      "List of tasks",
    ),
  },
});

export type ListRoute = typeof list;


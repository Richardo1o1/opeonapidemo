import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { z } from "@hono/zod-openapi";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const IdParamsSchema = z.object({
  id: z.coerce.number().openapi({
    param: {
      name: "id",
      in: "path",
      required: true,
    },
    required: ["id"],
    example: 12,
  }),
});

export const notFoundSchema = createMessageObjectSchema(HttpStatusPhrases.NOT_FOUND);
export const badRequestSchema = createMessageObjectSchema(HttpStatusPhrases.BAD_REQUEST);
import { AppRouteHandler } from "@/utility/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpstatusPhase from "stoker/http-status-phrases";
import { eq, sql } from "drizzle-orm";

import type { 
  CreateRoute, 
  DeleteByIdRoute, 
  GetByIdRoute, 
  ListRoute, 
  PatchRoute 
} from "./tasks.routes";

import db from "@/db";
import { tasks } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/utility/constants";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const tasks = await db.query.tasks.findMany();
  return c.json(tasks);
};

export const getById: AppRouteHandler<GetByIdRoute> = async (c) => {
  const { id } = c.req.valid("param");
 
  const task = await db.query.tasks.findFirst({
    where: (q, { eq }) => eq(q.id, id),
  });

  if ( !task ) {
    return c.json({ message: HttpstatusPhase.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  };

  return c.json(task, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const task = c.req.valid("json");
  const [inserted] = await db.insert(tasks).values(task).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length <= 1) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  };

  const [task] = await db.update(tasks)
    .set({
      ...updates,
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(tasks.id,id))
    .returning();

  if ( !task ) {
    return c.json({ message: HttpstatusPhase.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  };
  
  return c.json(task, HttpStatusCodes.OK);
};

export const deleteById: AppRouteHandler<DeleteByIdRoute> = async (c) => {
  const { id } = c.req.valid("param");
 
  const result = await db
    .delete(tasks)
    .where(eq(tasks.id, id));

  if ( result.rowsAffected === 0 ) {
    return c.json({ message: HttpstatusPhase.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  };

  return c.body(null, HttpStatusCodes.NO_CONTENT );
};

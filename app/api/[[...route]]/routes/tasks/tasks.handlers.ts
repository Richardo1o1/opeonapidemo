import { AppRouteHandler } from "@/utility/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpstatusPhase from "stoker/http-status-phrases";
import type { CreateRoute, GetByIdRoute, ListRoute } from "./tasks.routes";
import db from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

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
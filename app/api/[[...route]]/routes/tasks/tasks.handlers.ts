import { AppRouteHandler } from "@/utility/types";
import type { ListRoute } from "./tasks.routes";
import db from "@/db";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const tasks = await db.query.tasks.findMany();
  return c.json(tasks);
};
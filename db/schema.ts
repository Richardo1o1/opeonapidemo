import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = sqliteTable("tasks", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text("name")
    .notNull(),
  done: integer("done", { mode: "boolean" })
    .notNull()
    .default(false),
  order: integer("order", { mode: "number" })
    .notNull(),
  createdAt:  text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt:text('updated_at')
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const selectTasksSchema = createSelectSchema(tasks);
export const insertTasksSchema = createInsertSchema(
  tasks,
  {
    name: z.string().min(1).max(255),
    done: z.boolean(),
    order: z.number(),
  },
  ).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchTasksSchema = createUpdateSchema(
  tasks,
  {
    id: z.number(),
    name: z.string().min(1).max(255).optional(),
    done: z.boolean().optional(),
    order: z.number().optional(),
  },
  ).omit({
    createdAt: true,
    updatedAt: true,
});
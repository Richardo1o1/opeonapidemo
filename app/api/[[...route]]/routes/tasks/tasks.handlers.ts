import { AppRouteHandler } from "@/utility/types";
import type { ListRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = (c) => {
  return c.json([
    { name: "Learn OpenAPI", done: false },
    { name: "Learn Hono", done: true },
  ]);
};
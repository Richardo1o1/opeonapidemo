import { OpenAPIHono } from "@hono/zod-openapi";
import { handle } from 'hono/vercel';
import { notFound, onError } from "stoker/middlewares";
import {  pnLogger } from "@/middlewares/pino-logger";
import { PinoLogger } from "hono-pino";

interface AppBinding {
  Variables: {
    logger: PinoLogger;
  }
}
const app = new OpenAPIHono<AppBinding>().basePath('/api');

app.use(pnLogger());

app.get("/", (c) => {
  return c.text("Hello Hono");
});

app.get("/error", (c) => {
  c.status(422);
  //add a custom error message to logger
  c.var.logger.info("Wow! Log here");
  throw new Error("This is an error");
});

app.notFound(notFound);

app.onError(onError);

const port = 3001;
console.log(`Server running on port ${port}`);

export const GET = handle(app);

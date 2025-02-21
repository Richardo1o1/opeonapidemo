import { handle } from 'hono/vercel';

import createApp from "./lab/create-app";

const app = createApp();

app.get("/", (c) => {
  return c.text("Hello Hono");
});

app.get("/error", (c) => {
  c.status(422);
  //add a custom error message to logger
  c.var.logger.info("Wow! Log here");
  throw new Error("This is an error");
});


export const GET = handle(app);

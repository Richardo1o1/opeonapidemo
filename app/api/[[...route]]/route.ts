import { handle } from 'hono/vercel';

import createApp from "./lib/create-app";
import configureOpenAPI from './lib/configure-openapi';
import index from "./routes/index.route";
import tasks from "./routes/tasks/tasks.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  tasks,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});


export const GET = handle(app);

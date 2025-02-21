import { handle } from 'hono/vercel';

import createApp from "./lib/create-app";
import configureOpenAPI from './lib/configure-openapi';
import index from "./routes/index.route";
const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});


export const GET = handle(app);

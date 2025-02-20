import { handle } from 'hono/vercel';

import configureOpenAPI from "@/utility/configure-openapi";
import env from "@/utility/env";
import createApp from "@/utility/create-app";

const app = createApp();

configureOpenAPI(app);

export const GET = handle(app);

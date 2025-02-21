import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError } from "stoker/middlewares";
import {  pnLogger } from "@/middlewares/pino-logger";

import type { AppBinding } from "@/utility/types";

export default function createApp(){
    const app = new OpenAPIHono<AppBinding>({
        strict: false,
    }).basePath('/api');
    app.use(pnLogger());

    app.notFound(notFound);
    app.onError(onError);

    return app;
}

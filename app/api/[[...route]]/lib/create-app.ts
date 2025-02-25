import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import {  pnLogger } from "@/middlewares/pino-logger";
import type { AppBindings } from "@/utility/types";

export function createRouter() {
    return new OpenAPIHono<AppBindings>({
        strict: false,
        defaultHook
    });
};

export default function createApp(){
    const app = new OpenAPIHono<AppBindings>({
        strict: false,
    }).basePath('/api');
    app.use(pnLogger());

    app.notFound(notFound);
    app.onError(onError);

    return app;
}

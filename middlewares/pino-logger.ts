import { pinoLogger } from 'hono-pino';
import PinoPretty from 'pino-pretty';
import pino from 'pino';
import env from "@/utility/env";

export function pnLogger() {
  return pinoLogger({
    pino: pino({
      level: env?.LOG_LEVEL,
    }, env?.NODE_ENV === "production" ? undefined:PinoPretty()),
    http: {
      reqId: ()=> crypto.randomUUID(),
    }
  });
};


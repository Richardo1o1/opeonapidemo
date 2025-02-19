import { pinoLogger } from 'hono-pino';
import { PinoPretty } from 'pino-pretty';
import { pino } from 'pino';
import { expand } from 'dotenv-expand';
import { config } from 'dotenv';

expand(config());

export function pnLogger() {
  return pinoLogger({
    pino: pino({
      level: process.env.LOG_LEVEL || "info"
    }, process.env.NODE_ENV === "production" ? undefined:PinoPretty()),
    http: {
      reqId: ()=> crypto.randomUUID(),
    }
  });
};


import { z } from "zod";
import { expand } from 'dotenv-expand';
import { config } from 'dotenv';
import path from "node:path";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}));

const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(9999),
    LOG_LEVEL: z.enum(["fatal","error","warn", "info", "debug","trace","silent"]),
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string().optional(),
});

export type env = z.infer<typeof EnvSchema>;
// eslint-disable-next-line ts/no-redeclare
const parsedEnv = EnvSchema.safeParse(process.env);

if ( parsedEnv.success === false ) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(parsedEnv.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const env = parsedEnv.data;

export default env;
import z from "zod";
import 'dotenv/config';

export const env=z.object({
    PORT:z.coerce.number().default(3001),
    MONGODB_URI:z.string(),
    MONGODB_DATABASE_NAME:z.string(),
    DATABASE_HOST:z.string(),
    DATABASE_USER:z.string(),
    DATABASE_NAME:z.string(),
    DATABASE_PASSWORD:z.string(),
    DATABASE_SQL:z.string()
}).parse(process.env);
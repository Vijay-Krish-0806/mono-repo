import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
const sql = neon(
  process.env.DATABASE_URL! ||
    "postgresql://neondb_owner:npg_MzCB3VELKS5k@ep-gentle-star-adv5bd3a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    );
const db = drizzle(sql, { schema });

export default db;

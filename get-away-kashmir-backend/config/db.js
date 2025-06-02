import pg from "pg"

// setup database connection

const db = new pg.Client({
    user: process.env.PG_USER,
    host:  process.env.PG_HOST,
    database:  process.env.PG_DATABASE,
    password:  process.env.PG_PASSWORD,
    port:  process.env.PG_PORT,
  });

db.connect();

export default db;

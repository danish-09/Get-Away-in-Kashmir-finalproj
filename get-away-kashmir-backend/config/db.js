import pg from "pg"
import dotenv from "dotenv"

// for env variables
dotenv.config()


// setup database connection

const db = new pg.Client({
    user: process.env.PG_USER,
    host:  process.env.PG_HOST,
    database:  process.env.PG_DATABASE,
    password:  process.env.PG_PASSWORD,
    port:  process.env.PG_PORT,
  });

// connects to the db
db.connect();

// db client object
export default db;

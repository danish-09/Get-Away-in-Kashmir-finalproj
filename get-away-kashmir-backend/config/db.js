import pg from "pg"

// setup database connection

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "GET-AWAY IN KASHMIR",
    password: "postgre25",
    port: 5432,
  });

db.connect();

export default db;

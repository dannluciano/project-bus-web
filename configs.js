export default {
  HOSTNAME: "0.0.0.0",
  PORT: process.env["PORT"] || 3000,
  USERNAME: process.env["USERNAME"] || "admin",
  PASSWORD: process.env["PASSWORD"] || "ifpiifpi",
  DATABASE: process.env["DATABASE"] || "database.sqlite3",
  SCHEMA: process.env["SCHEMA"] || "schema.sql",
};

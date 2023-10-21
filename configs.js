export default {
    HOSTNAME: '127.0.0.1',
    PORT: 3000,
    USERNAME: process.env['USERNAME'] || 'admin',
    PASSWORD: process.env['PASSWORD'] || 'ifpiifpi',
    DATABASE: 'database.sqlite3',
    SCHEMA: 'schema.sql'
}


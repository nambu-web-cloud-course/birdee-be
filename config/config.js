require('dotenv').config();
const env = process.env;

const development = {
    username: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    host: env.MYSQL_HOST,
    dialect: "mysql",
    timezone: '+09:00', // 한국 시간대
    define: {
        "charset": "utf8mb4",
        "collate": "utf8mb4_unicode_ci"
    }
};

const production = {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
};

const test = {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
};

module.exports = { development, production, test };
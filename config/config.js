require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Parth@123',
        database: process.env.DB_NAME || 'auth_gateway',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql'
    },
    production: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'rootpassword',
        database: process.env.DB_NAME || 'auth_gateway',
        host: process.env.DB_HOST || 'mysql',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql'
    }
};

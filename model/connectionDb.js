require('dotenv').config();

const knex = require('knex')({
    client:'mysql',
    connection:{
        host : process.env.HOST,
        user : process.env.USER,
        password: process.env.PASSWORD,
        port: process.env.PORT,
        database : process.env.DATABASE
    }
});

module.exports = knex;

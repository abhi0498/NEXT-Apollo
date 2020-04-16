import Sequelize from 'sequelize'

//                               db name  db username db password
export const db = new Sequelize('carpet', 'postgres', '4262', {
    host: 'localhost',
    dialect: 'postgres',
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 3000,
        idle: 10000
    }
})



// const Sequelize = require('sequelize')

// module.exports = new Sequelize('codegig', 'postgres', '4262', {
//     host: 'localhost',
//     dialect: 'postgres',
//     operatorsAliases: false,
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 3000,
//         idle: 10000
//     }
// })


const Sequelize = require("sequelize");

const database = "todo_db";
const username = "postgres";
const password = "bhanu123";
const sequelize = new Sequelize(database,username,password,{
    host: "localhost",
    dialect:"postgres",
});
// sequelize.authenticate()
//     .then(()=>{
//         console.log("Connection has been estabalished successfully");
//     })
//     .catch((error)=>
//     {
//         console.error("unable to connect to the database: "+ error);
//     });

const connect = async()=>{
    return sequelize.authenticate();
}

module.exports ={
    connect,
    sequelize,
}
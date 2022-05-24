var mysql      = require('mysql');

const knex = require('knex')({
    client:'mysql',
    connection:{
        host : 'localhost',
        user : 'root',
        password: '',
        port: 3306,
        database : 'book_inventory'
    }
});



var userConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'user'
});
 
userConnection.connect((err)=>{
    if(err){
        console.log('there is some error',err);
    }else{
        console.log('connection successfull');
    }
});

module.exports = {userConnection};
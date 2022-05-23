var mysql      = require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'book_inventory'
});
 
connection.connect((err)=>{
    if(err){
        console.log('there is some error',err);
    }else{
        console.log('connection successfull');
    }
});

module.exports = connection;
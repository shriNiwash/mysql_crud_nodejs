var mysql      = require('mysql');


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

module.exports = userConnection;
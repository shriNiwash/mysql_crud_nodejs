const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const hbs = require('hbs');
const path = require('path');
port = process.env.PORT || 3000;
const connection = require('./model/mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const multer = require('multer');
// const userConnection = require('./model/user');


//body parser
app.use(bodyparser.json());
app.use(express.urlencoded({extended:false}));

//path declaration
const staticPath = path.join('__dirname',"../public");
app.use(express.static(staticPath));

//initializing session
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());


//views engine
app.set('view engine','hbs');
app.set('views','./views');

const router = require('./router/router');
const { application } = require('express');
const async = require('hbs/lib/async');
app.use(router);

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/insert',isAuthenticate,(req,res)=>{
    res.render('insert');
});

app.get('/login',(req,res)=>{
    res.render('login');
    console.log("The user is on login page");
})

//file upload with multer module
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/images');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

var upload = multer({storage:storage});

//book post
app.post('/insert',upload.single('blogimage'),(req,res)=>{
    var name = req.body.name;
    var sold = req.body.sold;
    var image = req.file.filename;
    console.log(name);
    console.log(sold);
    console.log(image);
    insert = "insert into book_inventory values(null,'"+name+"',"+sold+",'"+image+"')";
    connection.query(insert,(err,data)=>{
        if(err){
            console.log(err);
        }else{
            console.log('data inserted',data);
            res.redirect('/list');
        }
    })
});

//read operation
app.get('/list',isAuthenticate,(req,res)=>{
    const dat = "select * from book_inventory";
    connection.query(dat,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render('datalist',{list:data});
        }

    })
})

//update operation
app.get('/list/edit/:id',isAuthenticate,(req,res)=>{
    const ids = req.params.id;
    const quer = "select id,name,sold,image from book_inventory where id="+ids+"";
    connection.query(quer,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(data);
            console.log(data[0].name);
            res.render('update',{
                name:data[0].name,
                sold:data[0].sold,
                image:data[0].image,
                ide:ids
            })
        }
    })
})

//update post operation
app.post("/list/edit/:id",upload.single('blogimage'),(req,res)=>{
    const ids=req.params.id;
    const update_query = "select image from book_inventory where id="+ids+"";
    connection.query(update_query,(err,data)=>{
        if(req.file ==  null){
            const update = "update book_inventory set name='"+req.body.name+"',sold="+req.body.sold+",image='"+data[0].image+"' where id = "+ids+"";
            connection.query(update,(err,data)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log('data updated',data);
                    res.redirect('/list');
                    
                }
            })
        }
        else{
            const updat = "update book_inventory set name='"+req.body.name+"',sold="+req.body.sold+",image='"+req.file.filename+"' where id = "+ids+"";
            connection.query(updat,(err,data)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log('data updated',data);
                    res.redirect('/list');
                    
                }
            })
        }
    })
})

//delete operation
app.get("/list/delete/:id",isAuthenticate,(req,res)=>{
    const idss = req.params.id;
    const del = "delete from book_inventory where id ="+idss+"";
    connection.query(del,(err,data)=>{
        if(err){
            console.log(err);
        }else{
            console.log('one row deleted');
            res.redirect('/list');
            
        }
    })

});

//local streightegy
passport.use(new LocalStrategy(
    function(username, password, done) {
        const quer = "select username,password from user where username='"+username+"'";
      connection.query(quer, function (err, user) {
        if (err) { return done(err) }
        if (!user) { return done(null, false,{message:"Incorrect Username."}); }
        var passwords = user[0].password;
        console.log(passwords);
        if (passwords!=password) { return done(null, false,{message:"Incorrect Password."}); }
        if(!user || passwords!=password) {return done(null,false,{message:"The userid and passsword is incorrect"})}
        console.log(user);
        return done(null, user);
      });
    }
));


//serializeUser and deserialize
passport.serializeUser((user,done)=>{
    if(user){
        return done(null,user[0].username);
    }
    return done(null,false);
});


passport.deserializeUser((username,done)=>{
    const sel = "select * from user where username='"+username+"'";
    connection.query(sel,(err,user)=>{
        if(err) return done(null,false);
        return done(null,user);
    })
});

//logout feature
app.get('/logout',(req,res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('you are logged out');
        }
    });
    res.redirect('/login');
})

//authentication check
function isAuthenticate(req,res,done){
    console.log(req.user);
    if(req.user){
        return done();
    }
    else{
        res.redirect('/login');
        console.log("Invalid user");
    }
}

//registration of user
app.get('/register',(req,res)=>{
    res.render('registration');
})

app.post('/register',(req,res,done)=>{
    const da = "select username from user where username='"+req.body.username+"'";
    connection.query(da,(err,user)=>{
        console.log(user[0]);
        if(err) done(null,false);
        // else if(user){
        //     console.log('user already existed');
        //     res.redirect('/login');
        // }
        else{
                const inser = "insert into user values('"+req.body.username+"','"+req.body.password+"')";
                connection.query(inser,(err,data)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(data);
                        res.redirect('/login');
                    }
                })
        }
    })
});


//authenticate
app.post('/login', 
  passport.authenticate('local',{ failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/insert');
  });


app.listen(port,()=>console.log(`The server running on the port ${port}`));
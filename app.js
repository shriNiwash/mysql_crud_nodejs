const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const hbs = require('hbs');
const path = require('path');
port = process.env.PORTS || 3000;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const multer = require('multer');
const knex = require('./model/connectionDb');

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
app.post('/insert',upload.single('blogimage'),async(req,res)=>{
    var name = req.body.name;
    var sold = req.body.sold;
    var image = req.file.filename;
    const dat = {name,sold,image};
    // const insert_data = ( { name,sold,image } = req.body);
    console.log(name);
    console.log(sold);
    console.log(image);
    const data = await knex.insert(dat).into('book_inventory');
    if(data){
        console.log('data inserted',data);
        res.redirect('/list');

    }
    else{
        console.log('there is some error');
    }
});

//read operation

app.get('/list',isAuthenticate,async(req,res)=>{
    try{
        const data = await knex.select().from('book_inventory');
        res.render('datalist',{list:data});
    }
    catch(err){
        console.log(err);
    }
})

//update operation


app.get('/list/edit/:id',isAuthenticate,async(req,res)=>{
    const id = req.params.id;
    const qeury = { id };
    try{
        const data = await knex.select('id','name','sold','image').where(qeury).from('book_inventory');
        res.render('update',{
            name: data[0].name,
            sold:data[0].sold,
            image: data[0].image,
            ide: id
        })
        console.log(data);
    }
    catch(err){
        console.log(err);
    }



})
//update post operation

app.post('/list/edit/:id',upload.single('blogimage'),async(req,res)=>{
    const id = req.params.id;
    const query = { id };
    try{
        const data = await knex.select('image').where(query).from('book_inventory');
        const img = data[0].image;
        console.log(img);
        const name  = req.body.name;
        const sold = req.body.sold;
        const image = (req.file == null) ? img : req.file.filename;
        const update_data = { name , sold , image };
        const update_query = await knex('book_inventory').where(query).update(update_data);
        if(update_query){
            console.log('data updated',update_query);
            res.redirect('/list');
        } 
        else{
            console.log('there is some error');
        }
    }
    catch(err){
        console.log(err);
    }

})

//delete operation

app.get('/list/delete/:id',isAuthenticate,async(req,res)=>{
    const id = req.params.id;
    const que = { id };
    try{
        const data = await knex('book_inventory').delete().where(que);
        if(data){
            console.log('data deleted',data);
            res.redirect('/list');
        }
        else{
            console.log('there is some error');
        }
    }
    catch(err){
        console.log(err);
    }
})

passport.use(new LocalStrategy(
    function(username, password, done) {
        const dat = { username }
        // const quer = "select username,password from user where username='"+username+"'";
        knex('user').select('username','password').where({username}).asCallback(function (err, user) {
            console.log(user[0]);
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
    knex('user').select().where({username}).asCallback((err,user)=>{
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


app.post('/register',async(req,res)=>{
    const da = req.body.username;
    const data = { da };
    const user = knex('user').select('username').where(data);
    if(user[0] ==  null){
        const username = req.body.username;
        const password = req.body.password;
        const datas = { username,password };
        const data_insert = await knex('user').insert(datas);
        if(data_insert){
            console.log('user signed up',data_insert);
            res.redirect('/login');
        }
        else{
            console.log('error happened');
        }
    }
    else{
        res.redirect('/login');
    }
});


//authenticate
app.post('/login', 
  passport.authenticate('local',{ failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/insert');
  });


app.listen(port,()=>console.log(`The server running on the port ${port}`));
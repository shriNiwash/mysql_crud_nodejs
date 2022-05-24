const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const connection = require('../model/mysql');
const async = require('hbs/lib/async');


const knex = require('knex')({
    client: "mysql",
    connection:{
        host : "localhost",
        user : "root",
        password: "",
        port: 3306,
        database : "book_inventory",
    }
});

//body parser
router.use(bodyparser.json());
router.use(express.urlencoded({extended:false}));



router.post('/books',async(req,res)=>{
    const name = req.body.name;
    const sold = req.body.sold;
    const image = req.body.image;
    const all_data = { name , sold , image };
    try{
        const insert = await knex.insert(req.body).into('book_inventory');
        res.json(insert[0]);
        console.log('one row inserted',insert[0]);

    }
    catch(err){
        console.log(err);
    }


})

router.get("/books/list",async(req,res)=>{
    try{
    const data = await knex.select().from('book_inventory');
    res.json(data);
    console.log(data);
    }
    catch(err){
        console.log(err);
    }
})
   

router.patch('/books/list/:id',async(req,res)=>{
    const id = req.params.id;
    const query = { id };
    try{
        const update = await knex('book_inventory').update(req.body).where(query);
        console.log(update);
        res.json(update);
    }
    catch(err){
        console.log(err);
    }

})


router.delete('/books/list/:id',async(req,res)=>{
    const id = req.params.id;
    const query = { id };
    try{
        const data = await knex('book_inventory').delete().where(query);
        console.log('deleted');
        res.send('row deleted');

    }
    catch(err){
        console.log(err);
    }
})


router.get('/total-sales',async(req,res)=>{
    try{
        const data = await knex('book_inventory').sum('sold as total');
        console.log(data);
        res.json(data);
    }
    catch(err){
        console.log(err)
    }
})



module.exports = router;
const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const connection = require('../model/mysql');


//body parser
router.use(bodyparser.json());
router.use(express.urlencoded({extended:false}));


router.post('/books',(req,res)=>{
    const name = req.body.name;
    const sold = req.body.sold;
    const image = req.body.image;

    insert = "insert into book_inventory values(null,'"+ name +"',"+ sold +",'"+ image +"')";
    connection.query(insert,(err,data)=>{
        if(err){
            console.log(err);
        }else{
            console.log('one row inserted');
            res.send(data);
        }
    })
})
router.get('/books/list',(req,res)=>{
    const query = 'select * from book_inventory';
    connection.query(query,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.json(data);
        }
    })
});

router.patch('/books/list/:id',(req,res)=>{
    const ids = req.params.id;
    update = "update book_inventory set name='"+req.body.name+"',sold="+req.body.sold+",image='"+req.body.image+"' where id = "+ids+"";
    connection.query(update,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('tergeted id updated');
            res.send(data);

        }
    })
})

router.delete('/books/list/:id',(req,res)=>{
    const idss = req.params.id;
    const del = "delete from book_inventory where id ="+idss+"";
    connection.query(del,(err,data)=>{
        if(err){
            console.log(err);
        }else{
            console.log('one row is deleted');
            res.json(data);
        }
    })
})

//total-sales
// router.get('/total-sales',(req,res)=>{
//     const total_query = "select * from book_inventory";
//     connection.query(total_query,(err,data)=>{
//         if(err){
//             console.log(err);
//         }
//         else{
//             var sum = 0;
//             for (const total of data){
//                 sum = sum + total.sold;
//             }
//             const karan = {
//                 total: sum,
//             }
//             res.json(karan);
//         }
//     })
// });
router.get('/total-sales',(req,res)=>{
    const total_query = "SELECT SUM(sold) AS total FROM book_inventory";
    connection.query(total_query,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.json(data);
        }
    })
})


module.exports = router;
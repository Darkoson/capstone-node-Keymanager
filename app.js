const express = require ('express');

const { pool } = require("./config/dbconfig");

 const bcrypt = require('bcrypt');
 const passport = require('passport');
 const flash = require('express-flash');
const session = require ('express-session');
const pgsession = require('connect-pg-simple')(session);


require("dotenv").config();

const userroutes = require('./routes/userroutes');
const adminroutes = require('./routes/adminroutes');

const app = express();

const PORT = process.env.PORT || 5000;

const initialized = require('./config/passportconfig');
  initialized(passport);
  
//middleware
app.use(express.urlencoded({extended:false}));
app.set ("view engine","ejs");

app.use(express.static(__dirname+'/public/'))

app.use(session(
    {
      store: new pgsession({
        pool: pool,
        tableName: "session"
      }),
        secret: "secret",
        resave:false,
        saveUninitialized: false,
    }
));

app.use(passport.initialize());

app.use(passport.session());


app.use(flash());


app.use('/', userroutes)
app.use('/admin', adminroutes)





 app.get('/users/logout', (req, res) => {
     req.logout();
     req.flash("success_msg","you are logged out")
     res.redirect('/users/login')
  });

  app.get('/admin/logout', (req, res) => {
    req.logout();
    req.flash("success_msg","you are logged out")
    res.redirect('/admin/adminlogin')
 });

 app.get('/status/edit/:id', async(req, res)=>{
    const id =req.params.id
    const status = await pool.query( `SELECT status FROM keystorage where id = $1`,[id]);
        const newst = status.rows[0];
        if(newst.status === 'active'){
           await pool.query(`UPDATE keystorage SET status = 'revoked' where id =$1`,[id])
        }
        res.redirect('/admin/admindashboard')
  }
  )  ;  







app.listen(PORT,()=>(
    console.log(`server is running ${PORT}`)
));



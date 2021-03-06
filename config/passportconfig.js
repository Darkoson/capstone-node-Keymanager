const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbconfig")
const bcrypt = require("bcrypt");

function initialize(passport) {
  

  const authenticate =  (useremail, userpassword, done) => {
   
  pool.query(
      `SELECT * FROM userdata WHERE email = $1`,[useremail],
      (err, results) => {
        if (err) {
          throw err;
        }
        //console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];

          bcrypt.compare(userpassword, user.password, (err, isMatch) => {
            
            if (err) {
              throw err;
            }
            if (isMatch) {
              return done(null,user);
            } 
            
                
            else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } 
        
        
        
        else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "useremail", passwordField: "userpassword" },
      authenticate
    )
  );
 
  passport.serializeUser((user, done) => done(null, user.id));

  
  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM userdata WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      // console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;
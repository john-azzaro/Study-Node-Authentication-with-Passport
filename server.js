if (process.env.NODE_ENV !== 'production') {                // to load in environment variables, if we are in development
    require('dotenv').config();                             // require the dveelopment dependency and add config() to load in all the environment variables and set them in process.env(see app.use(session)).
}

const express = require('express');                         // import express
const app = express();                                      // get app variable from express
const bcrypt = require('bcrypt');                           // added bcrypt for security
const passport = require('passport');                       // add the passport library
const flash = require("express-flash");                     // add flash (for messages)
const session = require("express-session");                 // add session to persist login for user across app.


const initializePassport = require('./passport-config');     // call the passport config file for passport information
initializePassport(passport, email => {
    return users.find(user => user.email === email )});       // Function for finding user based on the email and the passport we are configuring                           

const users = [];                                          // local storage for users (would be mongodb in production)

app.set('view-engine', 'ejs');                             // use ejs view engine

app.use(express.urlencoded({ extended: false }));          // tells the application to take the email and password input and use them in the methods.
app.use(flash());                                          // use the flash middleware
app.use(session( {                                         // use the session middleware
    secret: process.env.SESSION_SECRET,                    // the "secret" is a key that will encrypt all the information which is gotten from environment variables, of which "SESSION_SECRET" will be put inside .env file.
    resave: false,                                         // should we resave the session variables if nothing has changed (we dont so its false)
    saveUninitialized: false,                              // should you save an empty value in the session... we dont so its false.
}));
app.use(passport.initialize());                            // Setup passport middleware to setup basics.
app.use(passport.session());                                // to store variables across the entire session, use passport.session middleware (works with app.use(session) above).


app.get('/', function(req, res) {                          // Route for Home Page (that you need to be logged into to get to)
    res.render('index.ejs', { name: 'joe'});               // The response will be to render a "index.ejs" page.
});

app.get('/login', function (req, res) {                    // Route for Login Page
    res.render('login.ejs');                               // ... which renders the login.ejs view.
});
                                                            // To use passport as our authentication for login, we use passport.authenticate with the "local" strategy and pass a list of option of things to modify (i.e. where to go if there is a success, failure , etc).
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',                                    // ... if the login is successful, redirect to home page.
    failureRedirect: '/login',                                // ... if the login is unsuccessful, redirect back to login screen.
    failureFlash: 'true'                                     // ... and if it is a failure, have a flash message (which will be the message in the initialize function in passport.congfig or password incorrect depending on the error)
}));       

app.get('/register', function (req, res) {                 // Route for Registration Page
    res.render('register.ejs');                            // ... which renders the registration.ejs view.
});

app.post('/register', async function(req, res) {                               // To create a user...
    try {                                                                      // create a try block to run our code...
        const hashedPassword = await bcrypt.hash(req.body.password, 10);             // hash the password from the user input (i.e. the body of the form where password is) and the value of 10 (good default).
        users.push({                                                          // Then we push this user to the local storage.
            id:  Date.now().toString(),                                        // ... this is a uuid, but a database would do this by default.
            name: req.body.name,                                               // ... this would get the name from the body of the form.
            email: req.body.email,                                             // ... this would get the email from the body of the form.
            password: hashedPassword                                           // ... this would get the password from the hashedPassword variable above.
        })         
        res.redirect('/login');                                                // and if everything works correctly, the response will be to redirect to the login page.                        
    } catch(err) {                                                             // If the try block fails, send an error.
        res.redirect('/register', );                                           // and respond by redirecting to the register page.
    }                                                    
});

app.listen(process.env.PORT || 3000, function() {                                             // listen on port 3000 for requests...
    console.log(`Your app is listening on port ${process.env.PORT || 3000}...`);
});
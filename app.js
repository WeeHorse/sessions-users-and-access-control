const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// we set the db global because we only want one mongoose connection and instance across the application 
global.mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost/session_auth_and_acl');
mongoose.connection.on('error', (e)=>{ console.error(e); });
mongoose.connection.once('open', ()=>{ console.info('db connected');});

// Session
const session = require('./session.js');

// ACL
const acl = require('./acl.js');

// User model
const User = require('./user-model.js');

// Create an Express app
const app = express();

// Register middleware
app.use(bodyParser.json()) // needed to post json
app.use(cookieParser()); // needed to read and set cookies
app.use(session);
app.use(acl);

// Register routes
app.get('/', (req, res)=>{
  res.json(req.params);
});

app.post('/register', async (req, res)=>{
  // create user
  let user = await new User(req.body);
  await user.save();
  // confirm registration (but not the password)
  user.password = '******';
  res.json(user);
});

app.get('/user', (req, res)=>{
  // check if there is a logged-in user and return that user
  let response;
  if(req.user._id){
    response = req.user;
    // never send the password back
    response.password = '******';
  }else{
    response = {message: 'Not logged in'};
  }
  res.json(response);
});

app.post('/login', async (req, res)=>{
  // create login from user
  let response;
  if(req.user._id){
    response = {message: 'Already logged in'};
  }else{
    let user = await User.find({email: req.body.email, password: req.body.password});
    if(user[0]){
      req.session.data.userId = user[0]._id;
      req.session.loggedIn = true;
      await req.session.save(); // save the userId and login to the session
      // below to avoid sending the password to the client
      user[0].password = '******';
      response = {message: 'Logged in', user: user[0]};
    }
  } 
  res.json(response);
});

app.all('/logout', async (req, res)=>{ // we are supposed to do delete login, but I guess any method asking for logout is fine too
  // instead of destroying the session (which works and is a normal procedure)
  //  we opt to remove the login, but keep the session
  req.user = {};
  req.session.loggedIn = false; 
  let result = await req.session.save();
  res.json({message: 'Logged out', session: req.session, user: req.user});
});

// any possible routes (with any method) that we have not already defined (so we can test the ACL)
app.all('*', (req, res)=>{
  res.json({params: req.params, body: req.body}); // just return some debugging, the ACL block happens in the ACL module
});



// Start the Express app on port 3000
app.listen(3000,()=>{
  console.log("Mystery Science Theatre 3000!");
});
var express= require("express");
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var mongoose = require('mongoose');
var users = express.Router();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
const saltRounds = 5;
var jwt = require('jsonwebtoken');
var token;
process.env.SECRET_KEY='sak';

var app = express();

app.set('views', __dirname + '/view');
app.use('/assets', express.static('assets'));



// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_id',
    secret: 'sak',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_id && !req.session.user) {
        res.clearCookie('user_id');        
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_id) {
        next();
    } else {
       res.redirect('/');
    }    
};

function loggedIn(req, res, next) {
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function(err) {
      next();
    });
  }else{
    res.redirect('/');
  }
}





Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var Bconnect = mongoose.createConnection('mongodb://dev:dev123@ds249623.mlab.com:49623/blogs',{
    useNewUrlParser: true
});
var Uconnect = mongoose.createConnection('mongodb://dev:dev123@ds249873.mlab.com:49873/users',{
    useNewUrlParser: true
});


var BlogSchema = new mongoose.Schema({
   title: { type : String },
   tags: {type : String},
   content: { type : String },
   created_on: { type : String},
   by: {type : String},
   comments: [{
        text: {type : String},
        commented_by: {type : String}
    }]
});
var UserSchema = new mongoose.Schema({
   email: { type : String },
   password: {type : String}
});

var Blog = Bconnect.model('Blog', BlogSchema);
var User = Uconnect.model('User', UserSchema);


app.get('/create',sessionChecker, function(req,res){
  res.render('createblog.ejs');
});

app.get('/view/',sessionChecker, function(req,res){
  Blog.find({}, function(err, data){
      if (err) return callback(err);
      res.render('viewblogs.ejs',{row: data,auth: req.session.user});
  });
});

app.post('/view',urlencodedParser, function (req, res) {
  console.log(req.body);
  d={ title: req.body.title,
      tags: req.body.tags,
      content: req.body.content,
      created_on: req.body.created_on,
      by: req.session.user[0].email
  };
  console.log(d);
  var newBlog = Blog(d).save(function(err,data){
    if(err) throw err;
    res.json(data);
  });
});

app.post('/view/update',urlencodedParser,function(req,res){
    var id = req.body['id'];
    delete req.body['id'];
    Blog.update({_id: id},{$set: req.body},function(err, data) {
        if (err) throw err;
           res.json(data);
    });       
});

app.post('/view/cmtadd',urlencodedParser,function(req,res){
    idd = req.body['id'];
    delete req.body['id'];
    d={ text: req.body.text,
        commented_by: req.session.user[0].email};
    Blog.update({_id: idd},{$push: {comments: d}},function(err, data) {
        if (err) throw err;
           res.json(data);
    });       
});

app.delete('/view/:id',function(req,res){
  Blog.find({_id: req.params.id}).remove(function(err, data){
     if (err) throw err;
      res.json(data);
  });
});

app.post('/view/cmt/:id1/:id2',function(req,res){
  Blog.update({_id: req.params.id1},{$pull: {comments: {_id: req.params.id2}}},function(err, data){
     if (err) throw err;
      res.json(data);
  });
});


// register post
app.post('/register_details',urlencodedParser,function(req,res){
    bcrypt.hash(req.body.pass, saltRounds, function(err, hash) {
      var userData = {
       email: req.body.email,
       password: hash
      };
      var newUser = User(userData).save(function(err, data) {
        if(err) throw err;
        req.session.user = data;
        res.json(data);
      });
    });
});

// login post
app.post('/login_details',urlencodedParser,function(req,res){
    var em = req.body.email;
    var password = req.body.pass;
    var r=res;
    var re=req;
    User.find({email: em}, function(err, data) {
       if (err) throw err;
       var d=data;
        if (data.length > 0) {
          bcrypt.compare(password, data[0].password, function(err, res) {
              if(res==true){
                token = jwt.sign({data: data[0]}, process.env.SECRET_KEY, {
                  expiresIn: 1000
                });
                re.session.user = d;
                r.json({"token": token,"id": data[0].id,"login": true});
              }else{
                r.json({"err": 'password did not match',"login": false});
              }
          });
        }else{
          r.json({"err": 'email not found',"login": false});
        }
    });
});

// register get
app.get('/register',function(req,res){
    res.render('register.ejs');
});

// logout get
app.get('/logout',function(req,res){
    token=null;
    if (req.session.user && req.cookies.user_id) {
        res.clearCookie('user_id');
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

app.get('/',function(req,res){
  res.render('login.ejs');
});
app.get('*',function(req,res){
  res.redirect('/');
});


app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
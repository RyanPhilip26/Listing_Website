if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const Register = require('./models/register');
const Login = require('./models/login');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
const Maps = require("@googlemaps/google-maps-services-js");
const fs = require('fs');
app.use(express.static(path.join(__dirname, '/public')));


const initializePassport = require('./config/passport-config');
const { findById } = require('./models/listing');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const users = []
 mongoose.connect('mongodb://localhost:27017/airListing')
    .then(() => {
        console.log("Connection Open");
    })
    .catch(err => {
        console.log("Error");
        console.log(err);
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

const categories = ['Studio Unit', 'Villa', 'Family Villa', 'Suite', 'Condo Unit'];

const upload = multer({storage: storage});


app.get('/listings/new', checkAuthenticated, (req, res) => {
    res.render('listings/new', {categories});
})
app.get('/', checkAuthenticated, (req, res) => {
    res.render('users/index', { name: req.user.name })
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('users/login')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/listings',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('users/register')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })
  
  app.delete('/logout', checkAuthenticated, (req, res, next) => {
    req.logOut((err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/login');
      });
    });
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

// Insert new listing
app.post('/listings', async (req, res) => {
    const newListing = new Listing(req.body);
    await newListing.save();
    console.log(newListing);
    res.redirect(`/listings/${newListing._id}`);
    
})

// Form for updating a listing
app.get('/listings/:id/updateListing', checkAuthenticated, async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/update', {listing, categories});
})

// Update a listing
app.put('/listings/:id', async (req, res) => {
    const {id} = req.params;
    
    const listing = await Listing.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    res.redirect(`/listings/${listing._id}`);
})

// Delete a listing
app.delete('/listings/:id', checkAuthenticated, async (req, res) => {
    const {id} = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
})


// View all listings
app.get('/listings', async (req, res) => {
  if (req.isAuthenticated()) {
    const {category} = req.query;
    if(category){
        const listings = await Listing.find({category});
        res.render('users/index', {listings, category});
    } else {
        const listings = await Listing.find({});
        res.render('users/index', {listings, category: 'All'});
    }
  }
  const {category} = req.query;
  if(category){
      const listings = await Listing.find({category});
      res.render('listings/index', {listings, category});
  } else {
      const listings = await Listing.find({});
      res.render('listings/index', {listings, category: 'All'});
  }
})

// View specific listing
app.get('/listings/:id', async (req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/read', {listing});
})



app.listen(3000, () => {
    console.log("Listening on port 3000.");
})
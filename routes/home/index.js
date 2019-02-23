const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'home';
    next();

});


//Displaying home page with all posts
router.get('/', (req, res)=>{
    const perPage = 10;
    const page = req.query.page || 1;

    Post.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then(posts=>{

        Post.countDocuments().then(postCount=>{
            Category.find({}).then(categories=>{
                res.render('home/index', {
                    posts: posts, 
                    categories: categories,
                    current: parseInt(page),
                    pages: Math.ceil(postCount / perPage)
                });
            });
        
        });
    });
});

//Displaying single blog post
router.get('/blogpost/:slug', (req, res)=>{
    Post.findOne({slug: req.params.slug})
        .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
        .populate('user')
        .then(post =>{
            Category.find({}).then(categories=>{
                res.render('home/blogpost', {post: post, categories: categories});
            });
        });
});

//Displaying about page
router.get('/about', (req, res)=>{
    res.render('home/about');
});

//Displaying register form
router.get('/register', (req, res)=>{
    res.render('home/register');

});

//Registering users
router.post('/register', (req, res)=>{
    let errors = [];
    
    //form validation on server-side
    if(!req.body.firstName) {
        errors.push({message: 'please add a first name'});
    }
    if(!req.body.lastName) {
        errors.push({message: 'please add a last name'});
    }
    if(!req.body.email) {
        errors.push({message: 'please add a valid email'});
    }
    if(!req.body.password) {
        errors.push({message: 'please add a password'});
    }
    if(!req.body.passwordConfirm) {
        errors.push({message: 'please confirm your password'});
    }
    if(req.body.password != req.body.passwordConfirm) {
        errors.push({message: 'password fields dont match'});
    }
    if(errors.length > 0){
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
            
        });
    } else {
        User.findOne({email: req.body.email}).then(user=>{
            if(!user) {                
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                newUser.password = hash;
                newUser.save().then(savedUser=>{
                    req.flash('Success_message', 'Account created successfuly, please login with your details');
                    res.redirect('/login');
                });
            });
        });
     } else {
        req.flash('error_message', 'Email already exist, please login');
        res.redirect('/login');
     }
 })

 }

});

//Displaying login form
router.get('/login', (req, res)=>{
    res.render('home/login');

});

//User authentication with passport
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
    User.findOne({email: email}).then(user=>{
        if(!user) return done(null, false, {message: 'Email not found'});
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) return err;
            if(matched){
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password' });
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//User login with passport
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);

});

//Log out user
router.get('/logout', (req, res)=>{
    req.logOut();
    req.flash('Success_message', 'Successfully logged out.');
    res.redirect('/login');

});





module.exports = router;
const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication');




router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();

});

//Displaying admin dashboard
router.get('/', (req, res)=>{
    const promises = [
        User.countDocuments().exec(),
        Post.countDocuments().exec(),
        Category.countDocuments().exec(),
        Comment.countDocuments().exec()

    ];

    Promise.all(promises).then(([userCount, postCount, categoryCount, commentCount])=>{

        res.render('admin/index', {userCount: userCount, postCount: postCount, categoryCount: categoryCount, commentCount: commentCount});

    });



    
});


//Fake post generator for testing
router.post('/generate-fake-posts', (req, res)=>{
    for (let i = 0; i < req.body.amount; i++){
        let post = new Post();
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();

        post.save(function(err){
            if(err) throw err;
        });
        
    }
    res.redirect('/admin/posts'); 
});







module.exports = router;
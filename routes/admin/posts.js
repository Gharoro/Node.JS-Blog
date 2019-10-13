const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const { userAuthenticated } = require('../../helpers/authentication');
const parser = require('../../helpers/postuploads');


router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();

});


//Displaying all posts
router.get('/', (req, res) => {
    Post.find({})
        .populate('category')
        .then(posts => {
            res.render('admin/posts', { posts: posts });
        }).catch(error => {
            res.send('Could not find posts'.error);
        });


});

//Displaying logged in user posts
router.get('/my-posts', (req, res) => {
    Post.find({ user: req.user.id })
        .populate('category')
        .then(posts => {
            res.render('admin/posts/my-posts', { posts: posts });
        });

});

//Displaying create post form
router.get('/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render('admin/posts/create', { categories: categories });

    });
});

//Adding posts
router.post('/create', parser.single('file'), (req, res) => {
    let errors = [];
    let { title, category, status, allowComments, body } = req.body;
    let file = req.file;
    if (!title) {
        errors.push({ message: 'please add a title' });
    }
    if (!body) {
        errors.push({ message: 'please add a body' });
    }
    if (!file) {
        errors.push({ message: 'please add an image' });
    }
    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {
        file = file.url;
        let allowComments = true;
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }
        const newPost = new Post({
            user: req.user.id,
            title,
            file,
            category,
            status,
            allowComments: allowComments,
            body
        });

        newPost.save().then(savedPost => {
            req.flash('Success_message', 'Post was created successfuly');
            res.redirect('/admin/posts');
        }).catch(error => {
            console.log('Could not save post');
        });
    }
});

//Displaying Edit post form
router.get('/edit/:slug', (req, res) => {
    Post.findOne({ slug: req.params.slug }).then(post => {
        Category.find({}).then(categories => {
            res.render('admin/posts/edit', { post: post, categories: categories });
        });
    });
});

//Editting posts
router.put('/edit/:slug', (req, res) => {
    Post.findOne({ slug: req.params.slug }).then(post => {
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }
        post.user = req.user.id;
        post.title = req.body.title;
        post.category = req.body.category;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;

        // if (!isEmpty(req.files)) {
        //     let file = req.files.file;
        //     filename = Date.now() + '-' + file.name;
        //     post.file = filename;
        //     let dirUploads = './public/upload/';

        //     file.mv(dirUploads + filename, (err) => {
        //         if (err) throw err;
        //     });
        // }

        post.save().then(updatedPost => {
            req.flash('Success_message', 'Post was edited successfuly')
            res.redirect('/admin/posts/my-posts');
        });

    });
});

//Deleting posts
router.delete('/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
        .populate('comments')
        .then(post => {

            if (!post.comments.length < 1) {
                post.comments.forEach(comment => {
                    comment.remove();

                });
            }
            post.deleteOne().then(postRemoved => {
                Comment.deleteOne().then(commentRemoved => {
                    req.flash('Success_message', 'Post was deleted successfuly')
                    res.redirect('/admin/posts/my-posts');

                });
            });
        });
});





module.exports = router;
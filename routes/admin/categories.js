const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();

});

//Display the categories
router.get('/', (req, res)=>{
    Category.find({}).then(categories=>{
        res.render('admin/categories/index', {categories: categories});
    });

});

//Creating the categories
router.post('/create', (req, res)=>{
    const newCategory = new Category({
        name: req.body.name
    });
    newCategory.save(savedCategory=>{
        req.flash('Success_message', 'Category was created successfuly');
        res.redirect('/admin/categories');
    });
});

//Editting the categories
router.get('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    });

});

//Deleting the categories
router.put('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(updatedCategory=>{
            req.flash('Success_message', 'Category was edited successfuly')
            res.redirect('/admin/categories');
        });
    
    });
});

router.delete('/:id', (req, res)=>{
    Category.findOne({_id: req.params.id})
    .then(category=>{
        category.remove();
            req.flash('Success_message', 'Category was deleted successfuly');
            res.redirect('/admin/categories');
    });  
});






    


module.exports = router;
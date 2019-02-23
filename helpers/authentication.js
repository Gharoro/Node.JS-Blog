module.exports = {



    userAuthenticated: function(req, res, next){


        if(req.isAuthenticated()){


            return next();

        }
        req.flash('error_message', 'You need to login to view that page');
        res.redirect('/login');


    }



};
var passport = require('passport');

var express = require('express');
var router = express.Router();
var Account = require('../models/account');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('register', { });
});

router.post('/', function(req, res, next) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render('register', { error : err.message });
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

module.exports = router;

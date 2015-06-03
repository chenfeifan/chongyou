/*
 * GET users listing.
 */
 var moment = require('moment');

 var User = require('../models/user');
 var Activity = require('../models/activity');

exports.routes = function(app){
	app.get('/', function(req, res, next){
        Activity.find({"status":"审核通过","time":{"$gt":moment().format('YYYY-MM-DD HH:mm')}}, null, {"limit":5,"sort":{"time":-1}}, function(err, list){
            res.render(app.get('terminal')+'index',{"title":"home","newActivity":list});
        });
    });
    app.get('/contacts', function(req, res){
        if (req.session.user) {
            User.find({}, null, {"sort":{"time":-1}}, function(err, doc){
                res.render(app.get('terminal')+'contacts',{"title":"contacts","user":req.session.user,"list":doc});
            });
        }else{
            res.render(app.get('terminal')+'contacts',{"title":"contacts","user":req.session.user,"list":[]});
        }
    });
    app.get('/user', function(req, res){
         User.find({}, null, {"sort":{"time":-1}}, function(err, doc1){
            Activity.find({"status":{"$ne":"删除"}}, null, {"sort":{"number":1}}, function(err, doc2){
                res.render(app.get('terminal')+'user',{"title":"user","user":req.session.user,"all":doc1,"active":req.query.active||"default","activity":doc2});
            });
            
        });
    });
    app.get('/help', function(req, res){
        User.find({"$or":[{"permission":"super"},{"permission":"admin"},{"permission":"fail"}]}, function(err, doc){
            res.render(app.get('terminal')+'help',{"title":"help","list":doc});
        });
    });
    app.get('/admin', function(req, res){
        res.render('admin',{"title":"admin","user":req.session.user});
    });
    app.get('/forget', function(req, res, next){
        var time = req.query.unt;
        var interval = parseInt(moment().format('YYYYMMDDHHmmss')) - parseInt(time.substr(17,14));
        if (/^fgt[0-9]{28}et$/.test(time) && interval < 86400) {
            res.render('forget',{"title":"forget","time":time.substr(3,14)});
        }else{
            next();
        }
    });
}
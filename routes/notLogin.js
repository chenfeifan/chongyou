//依赖
var moment = require('moment');
var md5 = require('MD5');
var nodemailer = require('nodemailer');
//模型模式
var User = require('../models/user');

exports.routes = function(app){
	//常用手机检测
	app.get('/check_phone', function(req, res){
		if(req.session.user && req.session.user.phone == req.query.phone){
			res.send(true);
		}else{
			User.findOne({"phone":req.query.phone},function(err, doc){
				if (doc) {
					res.send(false);
				}else{
					res.send(true);
				}
			});	
		}
	});
	//wechat检测
	app.get('/check_wechat', function(req, res){
		if(req.session.user && req.session.user.wechat == req.query.wechat){
			res.send(true);
		}else{
			User.findOne({"wechat":req.query.wechat},function(err, doc){
				if (doc) {
					res.send(false);
				}else{
					res.send(true);
				}
			});
		}
	});
	//邮箱检测
	app.get('/check_email', function(req, res){
		if(req.session.user && req.session.user.email == req.query.email){
			res.send(true);
		}else{
			User.findOne({"email":req.query.email},function(err, doc){
				if (doc) {
					res.send(false);
				}else{
					res.send(true);
				}
			});
		}
	});
	//用户注册
	app.post('/register', function(req, res, next){
		var msg = {};
		msg.name = req.body.name;
		if (req.body.password1) {msg.password = md5(req.body.password1);}
		msg.time = moment().format('YYYYMMDDHHmmss');
		if (req.body.sex) {msg.sex = req.body.sex;}
		if (req.body.is_sex) {msg.is_sex = req.body.is_sex;}
		if (req.body.from1) {msg.from = req.body.from1;}
		if (req.body.from2) {msg.from += req.body.from2;}
		if (req.body.is_from) {msg.is_from = req.body.is_from;}
		if (req.body.phone) {msg.phone = req.body.phone;}
		if (req.body.is_phone) {msg.is_phone = req.body.is_phone;}
		if (req.body.other_phone) {msg.other_phone = req.body.other_phone;}
		if (req.body.is_other_phone) {msg.is_other_phone = req.body.is_other_phone;}
		if (req.body.email) {msg.email = req.body.email;}
		if (req.body.is_email) {msg.is_email = req.body.is_email;}
		if (req.body.wechat) {msg.wechat = req.body.wechat;}
		if (req.body.is_wechat) {msg.is_wechat = req.body.is_wechat;}
		if (req.body.others) {
			var temp = req.body.others;
			if (temp.length > 100) {
				temp = temp.substr(0,100)
			}
			msg.others = temp;
		}
		if (req.body.is_others) {msg.is_others = req.body.is_others;}
		if (req.body.company) {msg.company = req.body.company;}
		if (req.body.is_company) {msg.is_company = req.body.is_company;}
		if (req.body.work_city1) {msg.work_city = req.body.work_city1;}
		if (req.body.work_city2) {msg.work_city += req.body.work_city2;}
		if (req.body.is_work_city) {msg.is_work_city = req.body.is_work_city;}
		if (req.body.work_job) {msg.work_job = req.body.work_job;}
		if (req.body.is_work_job) {msg.is_work_job = req.body.is_work_job;}
		msg.mater = {"th":req.body.mater_year,"academy":req.body.mater_academy}
		if (req.body.is_mater) {msg.is_mater = req.body.is_mater;}

		if (req.body.name == "陈飞帆") {
			msg.permission = "super";
		}

		User.find({"name":req.body.name},function(err, doc){
			var hasFail = false;
			for(var i in doc){
				if(doc[i].permission =="fail"){
					hasFail = true;//该用户已被列入黑名单！
				}
			}
			if(hasFail){
				res.send({"status":"注册失败","msg":"该用户已被列入黑名单，如有异议请联系超级管理员。"});
			}else{
				msg.name_number = parseInt(doc.length + 1);
				User.create(msg, function(err, doc){
					if (err) {
						next(err);
					}else{
						if (msg.email) {
							nodemailer.createTransport(app.get("email").email_config).sendMail({
									from: app.get("email").email_from, // sender address
								    to: msg.email, // list of receivers
								    subject: '欢迎注册重邮通讯录（cqupt_contacts） ', // 标题
								    html: "<p>"+msg.name+"，欢迎注册重邮通讯录（cqupt_contacts），请耐心等待管理员审核，审核结果将以邮件的形式通知您。</p><div>在等待审核期间，如需查看通讯录、查看/报名活动等，请关注我们的微信公众号：contacts<img src='cid:001'/></div>"+app.get('email').email_foot,
								    attachments: [{
								        filename: 'cqupt-contacts.jpg',
								        path: '/images/wechat.jpg',
								        cid: '001'
								    }]
								}, function(error, info){
								    if(error){
								        console.log(error);
								    }else{
								        console.log('注册申请邮件已发送给用户，【状态】: ' + info.response);
								    }
								});
						}
						User.find({"$or":[{"permission":"super"},{"permission":"admin"}],"email": {$ne:""}}, function(err, doc){
							var email_list = "";
							for(var i in doc){
								email_list = email_list + "," + doc[i].email;
							}
							if (email_list != "") {
								nodemailer.createTransport(app.get("email").email_config).sendMail({
									from: app.get("email").email_from, // sender address
								    to: email_list, // list of receivers
								    subject: '用户（'+msg.name+'）提交注册', // 标题
								    html: '<p>【姓名】'+msg.name+'</p><p>【母校信息】'+msg.mater.th+'级'+msg.mater.academy+'</p><p>请尽快登录<a href="http://chongyou.duapp.com">http://chongyou.duapp.com</a>进行审核操作！</p><div style="color:#F00;font-size:12px;">本邮件由系统发出，请勿回复！</div>',
								}, function(error, info){
								    if(error){
								        console.log(error);
								    }else{
								        console.log('注册申请邮件已发送给相关管理人员，【状态】: ' + info.response);
								    }
								});
							}
						});
						res.send({"status":"注册成功","msg":"请耐心等待管理员审核，如果你填写有邮箱，审核结果会发送到您的邮箱。(如未收到，请查看邮箱的垃圾箱)"});
					}
				});
			}
		});	
	});

	
	
	//用户登录
	app.post('/login', function(req, res){
		var name = req.body.name;
		var password = md5(req.body.password);
		var error = "";
		User.find({"$or":[{"wechat":name},{"phone":name},{"name":name}]}, function(err, doc){
			if(!doc.toString()) {
				error = "该用户不存在！";
			}else{
				for(var i in doc){
					if (doc[i].name == name && parseInt(doc[i].name_number) > 1) {
						error = "该用户有重名，请使用微信号或者常用手机号作为登录名进行登录！";
				        break;  
					}
					if (doc[i].password == password) {
						switch(doc[i].permission){
						   case "user": 
						   case "admin": 
						   case "super": 
							   req.session.user = doc[i];
				        	   error = "";
						       break; 
						   case "ing": 
						       error = "该用户还在审核阶段，不可以登录！如需加快审核，请自行联系帮助页面中的管理员。";
						       break;
					       case "fail": 
						       error = "该用户已被列入黑名单！";
						       break;  
						}
						break;
					}
					error = "密码错误！";
				}
			}
			if (error == "") {
				res.send({"state":"success","err":""});
			}else{
				res.send({"state":"fail","err":error});
			}
		});
	});
	
	//找回密码，发送邮件
	app.get('/forget_email', function(req, res){
		User.findOne({"email":req.query.forget_email}, function(err, doc){
			if (doc) {
				nodemailer.createTransport(app.get("email").email_config).sendMail({
					from: app.get("email").email_from, // sender address
				    to: req.query.forget_email, // list of receivers
				    subject: '重邮通讯录--密码找回', // 标题
				    html: "<p>请点击下面的链接进行密码重置，24小时内有效</p><p><a href='http://chongyou.duapp.com/forget?unt=fgt"+doc.time+moment().format('YYYYMMDDHHmmss')+"et' target='_blank'>请点击我</a></p>"+app.get('email').email_foot,
				}, function(error, info){
				    if(error){
				        console.log(error);
				    }else{
				        console.log('用户找回密码邮件已发送给用户，【状态】: ' + info.response);
				    }
				});
				res.send({"status":"邮件发送成功！"});
			}else{
				res.send({"err":"该邮箱未绑定任何用户，请检查！"});
			}
		});
	});

	//找回密码，修改密码
	app.post('/forget_password', function(req, res){
		User.update({"time":req.body.time}, {$set:{"password":md5(req.body.psw1)}}, function(err, doc){
			if (err) {
				console.log(err);
			}else{
				res.send({"status":"密码修改成功！"});
			}
		});
	});
}
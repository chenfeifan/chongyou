/*
 * has login.
 */
 //依赖
var moment = require('moment');
var md5 = require('MD5');
var nodemailer = require('nodemailer');
//模型模式
var User = require('../models/user');
var Log = require('../models/log');
var Activity = require('../models/activity');
//公共函数库

exports.routes = function(app){
	//中间件验证是否登录
	app.use(function(req, res, next){
		if (req.session.user) {
			next();
		}else{
			res.redirect('/user');	
		}
	})
	//注销
	app.get('/logout', function(req, res){
		delete req.session.user;
    	res.redirect('/user');
	});

	//操作
	app.post('/operate',function(req, res){
		var time = req.body.time;
		var permission = req.body.permission;
		if (permission == "del") {
			User.findOne({"time":time},function(err, doc1){
				var name = doc1.name;
				var name_number = parseInt(doc1.name_number);
				var del_email = doc1.email;
				User.remove({"time":time}, function(err, doc){
					if(del_email != ""){
						nodemailer.createTransport(app.get("email").email_config).sendMail({
							from: app.get("email").email_from, // sender address
						    to: del_email, // list of receivers
						    subject: '重邮通讯录--通知', // 标题
						    html: "<p>用户（"+name+(name_number==1?"":name_number)+"）已被管理员删除！</p>"+app.get('email').email_foot,
						}, function(error, info){
						    if(error){
						        console.log(error);
						    }else{
						        console.log('删除用户，发送邮件给用户，【状态】: ' + info.response);
						    }
						});
					}
					User.find({"name":name},function(err, doc2){
						for(var i in doc2){
							if (parseInt(doc2[i].name_number) > name_number) {
								User.update({"time":doc2[i].time}, {$set : { "name_number" : (parseInt(doc2[i].name_number)-1) }}, function(err, doc){});
							}
						}
					savaLog("success",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"删除用户（"+time+"）"});
			        res.send({"state":"操作成功！"});
					});
				});	
				
			});
		}else{
			User.update({"time":time}, {$set : { "permission" : permission }}, function(err, doc){
			    if(err) {
			        console.log(err);
					savaLog("fail",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"把用户（"+time+"）设置为"+permission});
			    }else{
			    	User.findOne({"time":time},function(err, us){
			    		if(us.email != ""){
			    			var email_content = "";
			    			switch(permission){
			    				case "user":
			    					email_content = "<p>恭喜您，用户（"+us.name+(us.name_number==1?"":us.name_number)+"）已审核通过，权限为：【普通用户】，可以登录系统进行相应操作了。</p>"+app.get('email').email_foot;
			    					break;
			    				case "fail":
			    					email_content = "<p>很遗憾通知您，用户（"+us.name+(us.name_number==1?"":us.name_number)+"）已被列入黑名单，如有疑问，请联系超级管理员。</p>"+app.get('email').email_foot;
			    					break;
			    				case "admin":
			    					email_content = "<p>用户（"+us.name+(us.name_number==1?"":us.name_number)+"）权限已被更改为【普通管理员】，您可以登录系统进行相应的管理操作了。</p>"+app.get('email').email_foot;
			    					break;
			    				case "super":
			    					email_content = "<p>用户（"+us.name+(us.name_number==1?"":us.name_number)+"）权限已被更改为【超级管理员】，您可以登录系统进行相应的高级管理操作了。</p>"+app.get('email').email_foot;
			    					break;
			    			}
							nodemailer.createTransport(app.get("email").email_config).sendMail({
								from: app.get("email").email_from, // sender address
							    to: us.email, // list of receivers
							    subject: '重邮通讯录--通知', // 标题
							    html: email_content,
							}, function(error, info){
							    if(error){
							        console.log(error);
							    }else{
							        console.log('更改用户权限，发送邮件给用户，【状态】: ' + info.response);
							    }
							});
						}
			    	});
			    	if (req.session.user.time == time) {
			    		req.session.user.permission = permission;
			    	}
					savaLog("success",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"把用户（"+time+"）设置为"+permission});
			        res.send({"state":"操作成功！"});
			    }
			});
		}

	});
	//修改是否公开
	app.post('/edit_state',function(req, res){
		var time = req.body.time;
		var edit_type = req.body.type;
		var state = req.body.state;
		var data = {};
		data[edit_type] = state;
		User.update({"time":time}, {$set : data}, function(err, doc){
		    if(err) {
		        console.log(err);
		    }else{
		    	req.session.user[edit_type] = state;
		        res.send({"state":"success!"});
		    }
		});
	});
	//修改个人信息
	app.post('/edit_personal',function(req, res){
		var data = {};
		if (req.body.phone) {data.phone = req.body.phone;}
		if (req.body.other_phone) {data.other_phone = req.body.other_phone;}
		if (req.body.email) {data.email = req.body.email;}
		if (req.body.wechat) {data.wechat = req.body.wechat;}
		if (req.body.others) {
			var temp = req.body.others;
			if (temp.length > 100) {
				temp = temp.substr(0,100)
			}
			data.others = temp;
		}
		if (req.body.company) {data.company = req.body.company;}
		if (req.body.work_city) {data.work_city = req.body.work_city;}
		if (req.body.work_job) {data.work_job = req.body.work_job;}

		User.update({"time":req.body.time}, {$set : data}, function(err, doc){
		    if(err) {
		        console.log(err);
		    }else{
		    	for(var i in data){
		    		req.session.user[i] = data[i];
		    	}
		        res.send({"status":"修改成功"});
		    }
		});
	});
	//修改密码
	app.post('/edite_psw',function(req, res){
		var old_password = md5(req.body.old_password);
		var new_password = md5(req.body.new_password);
		if (old_password != req.session.user.password) {
			res.send({"state":"fail","err":"原密码错误！"});
		}else{
			User.update({"time":req.session.user.time}, {$set : {"password":new_password}}, function(err, doc){
			    if(err) {
			        console.log(err);
			    }else{
			    	req.session.user.password = new_password;
			        res.send({"state":"success"});
			    }
			});
		}
	});
	//修改母校信息
	app.post('/edite_mater',function(req, res){
		var time = req.body.time;
		var year = req.body.year;
		var academy = req.body.academy;
		var mater = {
			"th":year,
			"academy":academy
		};
		User.update({"time":time}, {$set : {"mater":mater}}, function(err, doc){
		    if(err) {
		        console.log(err);
		        savaLog("fail",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"修改（"+time+"）母校信息"});
		        res.send({"state":"fail"});
		    }else{
		    	if(req.session.user.time == time){
		    		req.session.user.mater = mater;
		    	}
		        savaLog("success",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"修改（"+time+"）母校信息"});
		        res.send({"state":"success"});
		    }
		});
	});
	//重置密码
	app.post('/edite_resetPsw',function(req, res){
		var time = req.body.time;
		User.update({"time":time}, {$set : {"password":md5("chongyou")}}, function(err, doc){
		    if(err) {
		        console.log(err);
		        savaLog("fail",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"重置（"+time+"）密码"});
		        res.send({"state":"fail"});
		    }else{
		    	if(req.session.user.time == time){
		    		delete req.session.user;
		    	}
		        savaLog("success",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"重置（"+time+"）密码"});
		        res.send({"state":"success"});
		    }
		});
	});
	//获取日志
	app.post('/get_logs',function(req, res){
		var counts = req.body.number;
		Log.find({}, null, {"limit":parseInt(counts),"sort":{"time":-1}}, function(err, doc){
	        if (err) {
	          console.log(err);
	          res.send({"logs":[]});
	        }else{
		        res.send({"logs":doc});
	        }
      });
	});
	//发起活动
	app.post('/add_activity',function(req, res){
		var data = {};
		data.title = req.body.activity_title;
		data.content = req.body.activity_content;
		if (req.body.activity_time) {data.time = req.body.activity_time;}
		if (req.body.activity_address) {data.address = req.body.activity_address;}
		Activity.count({}, function(err, counts){
			data.number = counts + 1;
			data.fromName = req.session.user.name;
			data.fromTime = moment().format('YYYY-MM-DD HH:mm');
			Activity.create(data, function(err, doc){
				if (err) {
					console.log(err);
					savaLog("fail",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"发起活动（"+data.title+"）"});
				}else{
					savaLog("success",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"发起活动（"+data.title+"）"});
					res.send({"status":"活动发起成功","msg":"发起活动请求已提交，请耐心等待超级管理员审核！"});
				}
			});
		});
	});
	//活动状态操作
	app.post('/operate_activity',function(req, res){
		var number = req.body.number;
		var status = req.body.status;
		Activity.update({"number":number}, {$set : {"status":status}}, function(err, doc){
		    if(err) {
		        console.log(err);
		        savaLog("fail",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"把活动"+number+"设置为（"+status+"）"});
		    }else{
		    	console.log(err);
		    	savaLog("success",{"time":moment().format('YYYY-MM-DD HH:mm:ss'),"userTime":req.session.user.time,"user":req.session.user.name,"content":"把活动"+number+"设置为（"+status+"）"});
		        res.send({"status":"操作成功！"});
		    }
		});
	});
	//活动报名
	app.post('/activity_apply',function(req, res){
		var number = req.body.number;
		Activity.findOne({"number":number}, function(err, doc){
		    var newList = doc.list;
		    var addName = req.session.user.name;
		    if (req.session.user.name_number != 1 || req.session.user.name_number != "1" ) {
		    	addName += req.session.user.name_number;
		    }
		    newList[doc.list.length] = addName;
		    Activity.update({"number":number}, {$set : {"list":newList}}, function(err, doc){
			    res.send({"status":"报名成功！"});
		    });
		});
	});
   
}

function savaLog(state, data){
	data.state = state;
	Log.create(data, function(err, doc){});
}

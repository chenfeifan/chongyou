/*
 * wechat
 */
var wechat = require('wechat');
var moment = require('moment');

var User = require('../models/user');
var Activity = require('../models/activity');

// var config = {
//   token: 'cqupt',
//   appid: 'wx906b77b5c4a95bf7',
//   encodingAESKey: 'UhtxruiG6EH9nFOmNElIn01A8UzgpVO5kD8MGgQubdq'
// };

exports.routes = function(app){
	//微信接口验证
	app.use('/wechat', function(req, res, next){
    	if (req.query.echostr) {
    		console.log(moment().format('YYYY-MM-DD HH:mm') + "echostr = " + req.query.echostr);
	   		res.send(req.query.echostr);
   	   }else{
	   		next();
	   	}
    });

    app.use('/wechat', wechat("cqupt", function (req, res, next) {
	  // 微信输入信息都在req.weixin上
	  var message = req.weixin;
	  if(message.MsgType == 'text'){
	  	console.log("收到文字消息:" + message.Content);
	  	var head = message.Content.substr(0,1);
	  	//指令有错判断
	  	// var mark = false;   
	  	var responseText = "";
	  	switch(head){
	  		case "@":
		  		//活动列表
	  			if(message.Content.substr(1) == "活动"){
	  				Activity.find({"status":"审核通过","time":{"$gt":moment().format('YYYY-MM-DD HH:mm')}}, null, {"sort":{"time":-1}}, function(err, list){
			            for(var i in list){
			            	responseText = responseText + "【活动" + list[i]["number"] + "】" + list[i]["title"] + "；\n";
			            }
			            if (responseText == "") {
			            	responseText = '暂无活动！';	
			            }else{
				            responseText = responseText + '\n回复“@活动+序号”（如：“@活动1”）即可查看活动详情。';
			            }
			            res.reply({ type: "text", content: responseText}); 
			        });
			        break;
	  			}
	  			//具体活动信息
	  			if(message.Content.substr(1,2) == "活动"){
	  				var number = message.Content.substr(3);
	  				if(isNaN(parseInt(number))){
	  					// mark = true;
	  					res.reply({ type: "text", content: "指令不对，奴家看不懂啦~"});
	  					break;
	  				}else{
	  					number = parseInt(number);
	  					Activity.findOne({"number":number}, function(err, doc){
	  						if (doc) {
	  							responseText = responseText + "【活动" + list[i]["number"] + "】\n【主题】" + list[i]["title"] + "\n【时间】" + list[i]["time"] + "\n【地点】" + list[i]["address"] + "\n【活动详情】" + "\n【发起人】" + list[i]["fromName"] + "\n【已报名人数】" + list[i]["list"].length + "\n报名人员名单请到电脑端登录后查看，如需报名，请回复“+活动序号+姓名”（如：“+1+张三”）" ;
		  						res.reply({ type: "text", content: responseText}); 
	  						}else{
	  							res.reply({ type: "text", content: "此活动不存在！"});
	  						}
	  					});
	  				}
		  			break;
	  			}
	  			//查看通讯录
	  			if(message.Content.substr(1)){
	  				User.find({"name":message.Content.substr(1)}, function(err, doc){
  						for(var i in doc){
  							responseText = responseText + "【姓名】" + doc[i].name + "\n【常用手机】" + doc[i].phone + "\n【母校信息】" + doc[i].mater.th + "级," + doc[i].mater.academy;
  						}
  						if (responseText == "") {
  							res.reply({ type: "text", content: "【查询失败】\n1、可能是你指令中不小心加了空格。2、可能是该同学还没入住奴家的通讯录。"});
  						}else{
	  						res.reply({ type: "text", content: responseText}); 
  						}
	  				});
	  			}else{
	  				// mark = true;
	  				res.reply({ type: "text", content: "指令不对，奴家看不懂啦~"});
	  			}
	  			break;
	  		case '+':
	  			//报名活动
	  			var aApplyMessage = message.Content.split("+");
	  			if (aApplyMessage.length == 3) {
	  				if(isNaN(parseInt(aApplyMessage[1]))){
	  					res.reply({ type: "text", content: "活动序号有错，正确格式为：“+1+张三”（不用引号哦）"});
	  				}else{
		  				Activity.findOne({"number":parseInt(aApplyMessage[1])}, function(err, doc){
							var isHasApply = false;
						    var newList = doc.list;
						    var addName = aApplyMessage[2];
						    for(var i in newList){
						    	if(newList[i] == addName){
							    	isHasApply = true;
						    	}
						    }
						    if(isHasApply){
						    	res.reply({ type: "text", content: "该同学已报过名啦，不要把奴家当白痴！！！"});
						    }else{
							    newList[doc.list.length] = addName;
							    Activity.update({"number":number}, {$set : {"list":newList}}, function(err, doc){
								    res.reply({ type: "text", content: "报名成功！"});
							    });
						    }
						});
		  			}
	  			}else{
	  				// mark =true;
	  				res.reply({ type: "text", content: "指令不对，奴家看不懂啦~"});
	  			}
	  			break;
	  		case '"':
	  		case "“":
	  			responseText = "指令错误，指令不需要加引号。";
	  			break;
	  		default :
		  		res.reply({ type: "text", content: "【指令列表】\n1、@活动：查看活动信息。\n2、@+姓名（例如：“@张三”），查看通讯录中张三的信息。\n3、其他相关二级指令将在回复信息中说明。"});

	  	}
	  	// if (mark) {
	  	// 	console.log("指令不对，奴家看不懂啦~");
	  	// 	res.reply({ type: "text", content: "指令不对，奴家看不懂啦~"}); 
	  	// }
	  }
	}));
}
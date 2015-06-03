var User = require('../models/user');
var Activity = require('../models/activity');

exports.activity_apply =  function(activity_id, user_name, callback) {
	var result = "hehe";
	Activity.findOne({"number":activity_id}, function(err, doc){
		if (err) {
			result = err;
			return result;
		}else{
			var isHasApply = false;    //是否已报名
		    var newList = doc.list;
		    for(var i in newList){
		    	if(newList[i] == user_name){
			    	isHasApply = true;
		    	}
		    }
		    if(isHasApply){
		    	result = "此同学已报过名啦~";
		    	return result;
		    }else{
			    newList[doc.list.length] = user_name;
			    Activity.update({"number":activity_id}, {$set : {"list":newList}}, function(err, doc){
				    result = "报名成功！";
				    return result;
			    });
		    }
		}
	});	
}
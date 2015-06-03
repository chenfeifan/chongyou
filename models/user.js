var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: { type: String},
  name_number: { type: Number, default: 1},
  password: { type: String},
  permission: { type: String, default: "ing"},
  time: { type: String, default: ""},
  sex: { type: String},
  is_sex: { type: String, default: "off"},
  from: { type: String, default: ""},
  is_from: { type: String, default: "on"},
  phone: { type: String, default: ""},
  is_phone: { type: String, default: "on"},
  other_phone: { type: String, default: ""},
  is_other_phone: { type: String, default: "off"},
  email: { type: String, default: ""},
  is_email: { type: String, default: "on"},
  wechat: { type: String, default: ""},
  is_wechat: { type: String, default: "off"},
  others: { type: String, default: ""},
  is_others: { type: String, default: "off"},
  company: { type: String, default: ""},
  is_company: { type: String, default: "off"},
  work_city: { type: String, default: ""},
  is_work_city: { type: String, default: "on"},
  work_job: { type: String, default: ""},
  is_work_job: { type: String, default: "off"},
  mater: { type: Object, default: {th:"0000",academy:"无"}},
  is_mater: { type: String, default: "on"},
});

//模式的静态方法，只有进行模型实例化后才可用的方法
UserSchema.pre('save',function(next){
	//pre方法是在sava之前执行，不会与数据库进行交互。
	next();
});
UserSchema.statics = {};

module.exports = mongoose.model('ChongyouUser',UserSchema);
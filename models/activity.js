var mongoose = require('mongoose');

var ActivitySchema = new mongoose.Schema({
  number: { type: String},
  fromName: { type: String},
  fromTime: { type: String},
  status: { type: String, default: "未审核"},
  title: { type: String},
  content: { type: String},
  time: { type: String},
  address: { type: String, default: "无"},
  list: { type: Array, default: []}
});

//模式的静态方法，只有进行模型实例化后才可用的方法
ActivitySchema.pre('save',function(next){
	//pre方法是在sava之前执行，不会与数据库进行交互。
	next();
});
ActivitySchema.statics = {};

module.exports = mongoose.model('Activity',ActivitySchema);
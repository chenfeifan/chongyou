var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  time: { type: String},
  userTime: { type: String},
  user: { type: String},
  content: { type: String},
  state: { type: String, default: "success"},
});

//模式的静态方法，只有进行模型实例化后才可用的方法
LogSchema.pre('save',function(next){
	//pre方法是在sava之前执行，不会与数据库进行交互。
	next();
});
LogSchema.statics = {};

module.exports = mongoose.model('Log',LogSchema);
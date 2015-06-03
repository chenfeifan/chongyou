/*
 * error page
 */
exports.routes = function(app){
	app.use(function(err, req, res, next) {
	  if (!err) {
	    err.status = "404";
	    err.message = "This page doesn't exist"
	  }
	  res.render('error', {
	    message: err.message,
	    error: err
	  });
	});
   
}

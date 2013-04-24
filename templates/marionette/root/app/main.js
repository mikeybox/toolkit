require([
	// Application.
	"app",

	// Main Router.
	"router/router"
],

function(app, Router) {
	app.router = new Router();
	app.on("start",function(){
		Backbone.history.start();
	});

	app.start();

});

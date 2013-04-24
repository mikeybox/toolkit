define([
	// Application.
	"app",
	"router/paths",
	"router/controller"
],

function(app, paths, controller) {

	// Defining the application router, you can attach sub routers here.
	var Router = Backbone.Marionette.AppRouter.extend({
		"appRoutes":paths,
		"controller":controller
	});

	return Router;

});

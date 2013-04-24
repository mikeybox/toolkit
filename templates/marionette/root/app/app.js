define([
  "backbone",
  "backbone.marionette",
  "handlebars"
], function() {

  // Provide a global location to place configuration settings and module
  // creation.
  var app = new Backbone.Marionette.Application();
  app.paths = {
    // The root path to run the application.
    root: "",
    templates: "app/templates/"
  };

  window.app = app;

  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  // Configure Marionett to use Handlebars as the renderer.

  Marionette.TemplateCache.get = function( path ) {
    // Concatenate the file extension.
    path = app.paths.templates + path + ".html";

    // If cached, use the compiled template.
    if (JST[path]) {
      return JST[path];
    }

    $.ajax(path, {
        success:function(contents) {
          JST[path] = Handlebars.compile(contents);
        },
        async: false,
        cache: false
      }
    );
    return JST[path];
};
  // Mix Backbone.Events, modules, and layout management into the app object.
  return app;

});

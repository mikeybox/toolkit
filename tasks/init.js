module.exports = function(grunt){
	var bbyHome = grunt.option("bby-home");
	grunt.task.registerTask("project", "create a new marionette project", function(){
		grunt.task.run("init:"+bbyHome+"templates/marionette");
	});
};

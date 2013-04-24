'use strict';

// Basic template description.
exports.description = 'Export a Marionette BoilerPlate';

// Template-specific notes to be displayed before question prompts.
exports.notes = 'A basic template to output a Marionette Project start';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '{.*,*}';;

// The actual init template.
exports.template = function(grunt, init, done) {

	init.process({}, [
		// Prompt for these values.
		{
			name: 'projectName',
			message: 'Name your new project',
			default: 'New Project',
			warning: 'Your project name will be used to create a heroku instace unless otherwise specified'
		},
		{
			name: 'herokuProject',
			message: 'Will you stage your project on heroku',
			default: 'n',
			warning: 'If yes will create a heroku project using your project name with bby prepended'
		}
	], function(err, props) {
		props.projectName = grunt.util._.slugify(props.projectName);
		// Find the first `preferred` item existing in `arr`.
		function prefer(arr, preferred) {
			for (var i = 0; i < preferred.length; i++) {
				if (arr.indexOf(preferred[i]) !== -1) {
					return preferred[i];
				}
			}
			return preferred[0];
		}

		// Guess at some directories, if they exist.
		var dirs = grunt.file.expand({filter: 'isDirectory'}, '*').map(function(d) { return d.slice(0, -1); });
		props.lib_dir = prefer(dirs, ['lib', 'src']);
		props.test_dir = prefer(dirs, ['test', 'tests', 'unit', 'spec']);

		// Maybe this should be extended to support more libraries. Patches welcome!
		props.jquery = grunt.file.expand({filter: 'isFile'}, '**/jquery*.js').length > 0;

		// Files to copy (and process).
		var files = init.filesToCopy(props);

		// Actually copy (and process) files.
		init.copyAndProcess(files, props);

		// All done!
		done();
	});

};

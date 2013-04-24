var https = require('https');
var querystring = require('querystring');
var fs = require('fs');
var prompt = require('prompt');
var herokuLogin = null;

module.exports = function(grunt){
	var bbyHome = grunt.option("bby-home");
	grunt.task.registerTask("heroku-info", "Get info for the current heroku project instance", function(){
		var done = this.async();

		var req = herokuGet("/apps", null, function(data){
			grunt.log.header("Available Heroku Apps:");
			grunt.util._.each(data, function(item){
				logAppDetail(item);
			});
	
			done(true);
		});

	});

	grunt.task.registerTask("heroku-create", "Create a new heroku project.", function(name){
		var done = this.async();
		var options = { "name":name || "" };
		var schema = {
			properties:{
				name: {
					message: "",
					description: "Give your project a name or leave blank".white,
					type: "string"
				}
			}
		};

		if(options.name !== ""){
			herokuPost("/apps", {"app[name]":options.name}, appCreated);
		} else {
			prompt.start();
			prompt.message = ">>>".green;
			prompt.get(schema, function (err, result) {
				options = result;
				if(options.name === ""){
					grunt.log.writeln("heroku project name autogenerated".yellow);
					herokuPost("/apps", null, appCreated);
				}else{
					herokuPost("/apps", {"app[name]":options.name}, appCreated);	
				}
			});
		}
		
		function appCreated(result){
			logAppDetail(result);
		}
	});

	grunt.task.registerTask("heroku-destroy", "Destroy a heroku project", function(name){
		var done = this.async();
		var warning_schema = {
			properties: {
				confirm: {
					message: "Confirm delete command",
					description: "Are you sure you want to delete this app?".red + " [y/n]".white,
					type: "string"
				}
			}
		};

		var select_schema = {
			properties: {
				appIndex: {
					message: "Please select an application with a menu number",
					description: "Select Application".white,
					type: "string",
					pattern: /[0-9]+/,
					minLength: 1,
					required: true
				}
			}
		};

		prompt.start();
		
		if(name){
			_confirmDelete();
		}else{
			_selectApp();
		}

		function _selectApp(){
			herokuGet("/apps", null, function(apps){
				var appList = [];
				var longestName = 0;
				apps.forEach(function(app){
					appList.push(app.name);
					if(app.name.length > longestName){
						longestName = app.name.length;
					}
				});

				appList.forEach(function(app, index){
					appList[index] = grunt.util._.rpad(appList[index],longestName + 3) + '['+index.toString().green+']';
					grunt.log.writeln(appList[index]);
				});

				prompt.get(select_schema, function(err, result){
					name = apps[result.appIndex].name;
					grunt.log.writeln("\nYou have selected ".yellow + name.yellow);
					_confirmDelete();
				});
				
				
			});
		}

		function _confirmDelete(){
			prompt.message = "!!!".red;
			prompt.get(warning_schema, function(err, result){
				var confirm = result.confirm.toLowerCase();
				if(confirm[0] && confirm[0] == "y"){
					herokuDelete("/apps/"+name, null, function(result){
						var delMsg = name + " has been deleted";
						grunt.log.writeln(delMsg.yellow);
					});
				}else{
					grunt.log.writeln("delete action cancelled".grey);
				}
			});
		}
	});




	function logAppDetail(app){
		grunt.log.subhead("Project name: "+app.name);
		grunt.log.writeln("web url:      "+app.web_url);
		grunt.log.writeln("git url:      "+app.git_url);
		grunt.log.writeln("owner:        "+app.owner_email);
	}


	function getHerokuLogin(){
		var netrc = grunt.file.readYAML(process.env.HOME + "/.netrc");
		var machines = netrc.split("machine");
		var lines = netrc.split(" ");
		var netrcObject = {};
		var currentNode;

		for (var i in lines){
			if(lines[i] == "machine"){
				i = parseInt(i,10);
				currentNode = lines[i+1];
				netrcObject[currentNode] = {
					login: lines[i+3],
					password: lines[i+5]
				};
			}
		}

		if(!netrcObject.hasOwnProperty('api.heroku.com')){
			handleError("Please login first with your heroku cli tool", true);
		}
		
		return netrcObject;
	}


	function handleError(error, fatal){
		if(fatal){
			grunt.fail.fatal(error);
		}else{
			grunt.fail.warn(error);	
		}
	}

	function herokuGet(command, data, callback){
		return request(null, command, 'GET', data, callback);
	}

	function herokuPost(command, data, callback){
		return request(null, command, 'POST', data, callback);
	}

	function herokuDelete(command, data, callback){
		return request(null, command, 'DELETE', data, callback);
	}

	function encodeForm(data){

		return querystring.stringify(data);
	}

	function requestOptions(opt){
		var netrc = getHerokuLogin();
		var options = {
			hostname: 'api.heroku.com',
			port: 443,
			path: '/apps',
			method: 'GET',
			headers: {
				'Accept':'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': 0
			},
			auth:":" + netrc['api.heroku.com'].password

		};

		return options;
	}

	function request(hostname, path, method, data, callback){
		var requestOpt = {
			"hostname": hostname,
			"path":path,
			"method":method
		};
		var options = grunt.util._.defaults(requestOpt, requestOptions());

		data = encodeForm(data);

		options.headers['Content-Length'] = data.length;

		var requestBuffer = "";
		var req = https.request(options, function(res) {
			res.on('data', function(chunk) {
				requestBuffer += chunk;
			});

			res.on('end', function(){
				var response = JSON.parse(requestBuffer);
				if(response.hasOwnProperty("error")){
					handleError("An error occured with your heroku request : " + data.error +"\n", true);
				}
				if(callback){
					callback(response);
				}
			});
		});
		
		if(data){
			req.write(data + "\n");
		}
		req.end();

		req.on('error', handleError );

		return req;
	}
	
};
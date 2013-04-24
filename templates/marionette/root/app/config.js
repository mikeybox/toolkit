require.config({

    deps: ["main"],

    "packages": [
        {
            "name": "backbone",
            "location": "../vendor/lib/backbone",
            "main": "backbone.js"
        },
        {
            "name": "backbone.marionette",
            "location": "../vendor/lib/backbone.marionette",
            "main": "backbone.marionette.js"
        },
        {
            "name": "jquery",
            "location": "../vendor/lib/jquery",
            "main": "jquery.js"
        },
        {
            "name": "lodash",
            "location": "../vendor/lib/lodash",
            "main": "./lodash.js"
        },
        {
            "name": "handlebars",
            "location": "../vendor/lib/handlebars",
            "main": "handlebars.js"
        }
    ],
    "version": "0.2.11",
    "shim": {
        "backbone": {
            "deps": [
                "jquery",
                "lodash"
            ],
            "exports": "Backbone"
        },
        "backbone.marionette": {
            "deps": [
                "backbone"
            ]
        }
    }

});
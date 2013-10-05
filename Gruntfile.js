//----------------------------------------------------------------------------------------------------------------------
// RPGKeeper Gruntfile.
//----------------------------------------------------------------------------------------------------------------------

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		project: {
			css: "client/css",
			less: "client/less",
			systems: {
				less: "systems/**/less",
                js: "systems/**/js",
                controllers: "<%= project.systems.js %>/*controllers*.js",
                filters: "<%= project.systems.js %>/*filters*.js"
			}
		},
        less: {
            dev: {
                files: {
                    '<%= project.css %>/rpgkeeper.css': ['<%= project.less %>/*.less', '<%= project.systems.less %>/*.less']
                }
            },
            min: {
                options: {
                    compress: true
                },
                files: {
                    '<%= project.css %>/rpgkeeper.min.css': ['<%= project.less %>/*.less', '<%= project.systems.less %>/*.less']
                }
            }
        },
        develop: {
            server: {
                file: 'server.js'
            }
        },
        watch: {
            rpgkeeper: {
                files: ['server.js', 'lib/*.js', 'systems/**/system.js', 'systems/**/models.js'],
                tasks: ['develop'],
                options: {
                    atBegin: true,
                    nospawn: true
                }
            },
            systems_js: {
                files: ['<%= project.systems.js %>/*.js'],
                tasks: ['controllers', 'filters'],
                options: {
                    atBegin: true
                }
            },
            less: {
                files: ['<%= project.less %>/*.less', '<%= project.systems.less %>/*.less'],
                tasks: ['less'],
                options: {
                    atBegin: true
                }
            }
        }
    });

    // Grunt Tasks.
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Task for building systems.controller.js
    grunt.registerTask('controllers', 'build systems.controllers.js file', function () {
        grunt.file.copy('client/js/systems.controllers.tpl.js', 'client/js/systems.controllers.js', {process: grunt.template.process});
    });

    // Task for building systems.filters.js
    grunt.registerTask('filters', 'build systems.filters.js file', function () {
        grunt.file.copy('client/js/systems.filters.tpl.js', 'client/js/systems.filters.js', {process: grunt.template.process});
    });

    grunt.registerTask('build', ['less']);
};

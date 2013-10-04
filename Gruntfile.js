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
				less: "systems/**/less"
			}
		},
        recess: {
            options: {
                compile: true
            },
            epic: {
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
        watch: {
            less: {
                files: ['<%= project.less %>/*.less', '<%= project.systems.less %>/*.less'],
                tasks: ['recess'],
                options: {
                    atBegin: true
                }
            }
        }
    });

    // Grunt Tasks.
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['recess']);
};

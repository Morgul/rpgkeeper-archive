//----------------------------------------------------------------------------------------------------------------------
// RPGKeeper Gruntfile.
//----------------------------------------------------------------------------------------------------------------------

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		project: {
			css: "client/css",
			less: "client/less"
		},
        html2js: {
            rpgkeeper: {
                src: ['client/**/*.tpl.html'],
                dest: 'client/js/client.templates.js',
                options: {
                    base: 'client',
                    module: 'rpgkeeper.client.templates',
                    rename: function (moduleName) {
                        return '/' + moduleName.replace('.tpl', '');
                    }
                }
            }
        },
        less: {
            dev: {
                options: {
                    paths: ['client/vendor']
                },
                files: {
                    '<%= project.css %>/rpgkeeper.css': ['<%= project.less %>/*.less']
                }
            },
            min: {
                options: {
                    paths: ['client/vendor'],
                    compress: true
                },
                files: {
                    '<%= project.css %>/rpgkeeper.min.css': ['<%= project.less %>/*.less']
                }
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: 'client/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'client/css/',
                ext: '.min.css'
            }
        },
        develop: {
            server: {
                file: 'server.js'
            }
        },
        watch: {
            rpgkeeper: {
                files: ['server.js', 'lib/*.js'],
                tasks: ['develop'],
                options: {
                    atBegin: true,
                    nospawn: true
                }
            },
            html2js: {
                files: ['client/**/*.tpl.html'],
                tasks: ['html2js'],
                options: {
                    atBegin: true
                }
            },
            less: {
                files: ['<%= project.less %>/*.less'],
                tasks: ['less', 'cssmin'],
                options: {
                    atBegin: true
                }
            }
        }
    });

    // Grunt Tasks.
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Setup the build task.
    grunt.registerTask('build', ['less', 'cssmin', 'html2js']);
};

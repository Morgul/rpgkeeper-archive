//----------------------------------------------------------------------------------------------------------------------
// RPGKeeper Gruntfile.
//----------------------------------------------------------------------------------------------------------------------

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dist: {
            css: "dist/css"
        },
		project: {
			css: "client/css",
			less: "client/less"
		},
        less: {
            dev: {
                options: {
                    paths: ['static/vendor', 'node_module']
                },
                files: {
                    '<%= dist.css %>/rpgkeeper.css': ['<%= project.less %>/*.less']
                }
            },
            min: {
                options: {
                    paths: ['static/vendor', 'node_module'],
                    compress: true
                },
                files: {
                    '<%= dist.css %>/rpgkeeper.min.css': ['<%= project.less %>/*.less']
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
        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'static/', src:'vendor/**/*.*', dest:'dist/' },
                    { expand: true, cwd: 'static/', src:'images/**/*.*', dest:'dist/' },
                    { expand: true, src: ['client/**/*.*', '!client/index.html'], dest:'dist/' },
                    { expand: true, cwd: 'client/', src:'index.html', dest:'dist/' }
                ]
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
            copy: {
                files: ['client/**/*.*'],
                tasks: ['copy'],
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
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Setup the build task.
    grunt.registerTask('build', ['less', 'cssmin', 'copy']);
};

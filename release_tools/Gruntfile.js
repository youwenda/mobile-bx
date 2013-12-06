/*jshint -W106 */
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Task configuration
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			options: {
				force: true
			},
			src: ['../build/*']
		},
		concat: {
			js: {
				src: [
					'../kissy/src/*.js'
				],
				dest: '../build/brix.js'
			}
		},

        uglify:{
            build:{
                src: "../build/brix.js",
                dest: "../build/brix-min.js"
            },
            options: {
                beautify : {
                    "ascii_only" : true
                }
            }
        }
	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task
	grunt.registerTask('default', ['clean', 'concat', 'uglify']);

};
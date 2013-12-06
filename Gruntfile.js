module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: "build/"
            },
            options: {
                force: true
            }
        },
        brixjs: {
            brixjs: {
                files: {
                    "build/": "kissy/src/"
                }
            }
        },
        watch: {
            watchbrixjs: {
                files: 'kissy/src/*.js',
                tasks: ['brixjs']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //tasks
    grunt.loadTasks('tasks');

    // Default task.
    //grunt.registerTask('default', ['chartsjs']);
    grunt.registerTask('default', ['clean', 'brixjs','watch']);
};
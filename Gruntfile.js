// Project Gruntfile
module.exports = function (grunt) { // jshint ignore:line
	'use strict';

	grunt.initConfig({
		pkg   : grunt.file.readJSON('package.json'),
		watch : {
			less : {
				files: ['public/build/less/**/*.less'],
				tasks: ['less:development', 'less:production']
			},
			sass : {
				files: ['public/build/sass/**/*.scss'],
				tasks: ['sass:development', 'sass:production']
			},
			js   : {
				files: ['public/build/js/*.js'],
				tasks: ['uglify']
			}
		},
		notify: {
			less: {
				options: {
					title  : 'Project',
					message: 'LESS finished running'
				}
			},
			js  : {
				options: {
					title  : 'Project',
					message: 'JS bundler finished running'
				}
			}
		},
		less  : {
			// Development not compressed
			development  : {
				files: {
					'public/css/style-less.css'	: 'public/build/less/styles.less'
				}
			},
			// Production compressed version
			production   : {
				options: {
					compress: true
				},
				files  : {
					'public/css/style-less.min.css'	: 'public/build/less/styles.less'
				}
			},
		},
		sass  : {
			// Development not compressed
			development  : {
				files: {
					'public/css/style-sass.css' : 'public/build/sass/styles.scss'
				}
			},
			// Production compressed version
			production   : {
				options: {
					style: "compressed"
				},
				files  : {
					'public/css/style-sass.min.css' : 'public/build/sass/styles.scss'
				}
			},
		},
		uglify: {
			development : {
				options: {
					sourceMap: false,
					mangle : false,
					compress: false,
					beautify: true,
					banner:	'/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
				},
				files: {
					'public/js/PDI.js' : [
						'public/build/js/console.js',
						'public/build/js/PDI.js'
					],
					'public/js/application.js': [
						'public/build/js/application.js',
					]
				}
			},
			production : {
				options: {
					sourceMap: false,
					mangle : true,
					compress: true,
					beautify: false,
					banner:	'/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
				},
				files: {
					'public/js/application.min.js': [
						'public/build/js/PDI.js',
						'public/build/js/application.js',
					]
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');

	grunt.registerTask('css', ['less:development', 'less:production', 'sass:development', 'sass:production']);
	grunt.registerTask('default', ['watch']);
};
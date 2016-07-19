module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['public/app/**/*.js', 'server/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['public/styles/**/*.scss', 'public/app/**/*.js', 'server/**/*.js'],
      tasks: ['jshint', 'concat', 'sass']
    },
    concat: {
      dist: {
        src: [
          'public/app/app.module.js',
          'public/app/app.controller.js',

          'public/app/about/**/*.factory.js',
          'public/app/about/**/*.controller.js',

          'public/app/auth/**/*.factory.js',
          'public/app/auth/**/*.controller.js',

          'public/app/consumers/**/*.factory.js',
          'public/app/consumers/**/*.controller.js',

          'public/app/landing/**/*.factory.js',
          'public/app/landing/**/*.controller.js',

          'public/app/promoters/**/*.factory.js',
          'public/app/promoters/**/*.controller.js',

          'public/app/search/**/*.factory.js',
          'public/app/search/**/*.controller.js',

          'public/app/shared/**/*.factory.js',
          'public/app/shared/**/*.controller.js',

          'public/app/sound/**/*.factory.js',

          'public/app/ui-router/app.config.js'
        ],
        dest: 'public/dist/built.js',
      }
    },
    sass: {
      options: {
        sourceMap: true,
      },
      dist: {
        files: {
          'public/dist/style.css': 'public/styles/style.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('default', ['jshint', 'concat', 'sass']);
};


'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // this is to generate the API documentation
    ngdocs: {
      options: {
        dest: 'dist/docs',
        html5Mode: true,
        startPage: '/api',
        title: 'angular-django-rest-resource'
      },
      api: {
        src: ['angular-django-rest-resource.js'],
        title: 'API Documentation'
      }
    }
  });

  grunt.registerTask('test', function() {
    // TODO.
    console.log('sorry, no tests yet.')
  });

  grunt.registerTask('default', [
    'ngdocs',
    'test'
  ]);
};

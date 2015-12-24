module.exports = function(grunt) {

  var config = require('./.secret.json');

  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    screeps: {
      options: {
        email: config.email,
        password: config.password,
        branch: grunt.option('branch') || 'dev'
      },
      dist: {
        src: [grunt.option('path') ||'Mainframe/*.js']
      }
    }
  });
}
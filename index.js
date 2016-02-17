'use strict';

var gulp = require('gulp');
var maven = require('gulp-maven-deploy');
var path = require('path');
var runSequence = require('run-sequence');

module.exports.registerTasks = function(opt_options) {
  var options = opt_options || {};
  options.packageJsonPath = path.resolve(options.packageJsonPath || 'package.json');

  var packageJson = require(options.packageJsonPath);
  var finalName = '{' + packageJson.name + '}-{' + packageJson.version + '}';

  gulp.task('prepare-maven-snapshot', function() {
	   return gulp.src(['**/*', '!node_modules/', '!node_modules/**'])
  		.pipe(gulp.dest('maven-dist/META-INF/resources/webjars/senna.js/1.0.0-SNAPSHOT'));
  });

  gulp.task('install-maven-snapshot', function() {
  	return gulp.src('.')
  		.pipe(maven.install({
  			'config': {
  				'artifactId': packageJson.name,
  				'buildDir': 'maven-dist',
  				'finalName': finalName,
  				'groupId': 'com.liferay.webjars',
  				'type': 'jar'
  			}
  		}));
  });

  gulp.task('prepare-maven-artifact', function() {
  	return gulp.src(['**/*', '!node_modules/', '!node_modules/**'])
  		.pipe(gulp.dest(
        path.join('maven-dist/META-INF/resources/webjars', packageJson.name, packageJson.version)
      ));
  });

  gulp.task('publish-maven-artifact', function() {
  	return gulp.src('.')
  		.pipe(maven.deploy({
  			'config': {
  				'artifactId': packageJson.name,
  				'buildDir': 'maven-dist',
  				'finalName': finalName,
  				'groupId': 'com.liferay.webjars',
  				'type': 'jar',
  				'repositories': [
  					{
  						'id': 'liferay-nexus-ce',
  						'url': 'https://repository.liferay.com/nexus/content/repositories/liferay-releases-ce/'
  					}
  				]
  			}
  		}));
  });

  gulp.task('maven-install', function(done) {
  	runSequence('prepare-maven-snapshot', 'install-maven-snapshot', done);
  });

  gulp.task('maven-publish', function(done) {
  	runSequence('prepare-maven-artifact', 'publish-maven-artifact', done);
  });
};

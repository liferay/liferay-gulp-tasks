'use strict';

var cheerio = require('gulp-cheerio');
var del = require('del');
var format = require('xml-formatter');
var fs = require('file-system');
var maven = require('gulp-maven-deploy');
var path = require('path');
var prompt = require('gulp-prompt');
var runSequence = require('run-sequence');

module.exports = function(gulp, opt_options) {
	var options = opt_options || {};
	options.artifactIdPrefix = options.artifactIdPrefix || 'com.liferay.webjars.';
	options.artifactSrc = options.artifactSrc || ['**/*', '!node_modules/', '!node_modules/**'];
	options.packageJsonPath = path.resolve(options.packageJsonPath || 'package.json');
	options.repositories = options.repositories || {
		releases: [
			{
				'id': 'liferay-public-releases',
				'url': 'https://repository.liferay.com/nexus/content/repositories/liferay-public-releases/'
			}
		],
		snapshots: [
			{
				'id': 'liferay-public-snapshots',
				'url': 'https://repository.liferay.com/nexus/content/repositories/liferay-public-snapshots/'
			}
		]
	};

	var getFinalName = function(config) {
		return getName() + '-' + getVersion(config);
	};

	var getName = function() {
		return options.artifactName || require(options.packageJsonPath).name;
	};

	var getVersion = function(config) {
		var version = require(options.packageJsonPath).liferayVersion || require(options.packageJsonPath).version;

		return (config && config.snapshot) ? version + '-SNAPSHOT' : version;
	};

	gulp.task('clean-maven-dist', function(callback) {
		del(['maven-dist', './node_modules/liferay-gulp-tasks/settings.xml']).then(function() {
			callback();
		});
	});

	gulp.task('prepare-maven-install', function() {
		return gulp.src(options.artifactSrc)
			.pipe(gulp.dest(
				path.join('maven-dist/META-INF/resources/webjars', getName(), getVersion({snapshot: false}))
		));
	});

	gulp.task('prepare-maven-snapshot', function() {
		return gulp.src(options.artifactSrc)
			.pipe(gulp.dest(
				path.join('maven-dist/META-INF/resources/webjars', getName(), getVersion({snapshot: true}))
		));
	});

	gulp.task('init-maven-install', function() {
		var settingsXML;
		var webjarPath;

		var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

		var currentSettingsXML = path.resolve(homeDir, '.m2/settings.xml');
		var newSettingsXML = './node_modules/liferay-gulp-tasks/settings.xml';

		if (fs.existsSync(currentSettingsXML)) {
			settingsXML = currentSettingsXML;
		}
		else {
			var xml = '<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd"><localRepository></localRepository><interactiveMode/><usePluginRegistry/><offline/><pluginGroups/><servers/><mirrors/><proxies/><profiles/><activeProfiles/></settings>';

			xml = format(xml);

			fs.writeFile(newSettingsXML, xml);

			settingsXML = newSettingsXML;
		}

		return gulp.src(settingsXML)
			.pipe(prompt.prompt(
				[
					{
						type: 'input',
						message: 'Please input the full path where you want this WebJar created, if different from the default (${user.home}/.m2/repository):',
						name: 'webjarPath'
					}
				],
				function(response) {
					webjarPath = response.webjarPath;
				}
		))
		.pipe(cheerio({
			run: function ($, file) {
				$('localRepository').text(webjarPath);
			},
			parserOptions: {
				xmlMode: true
			}
		}))
		.pipe(gulp.dest(path.resolve(homeDir, '.m2')));
	});


	gulp.task('install-maven-release', function() {
		var snapshotConfig = { snapshot: false };

		return gulp.src('.')
			.pipe(maven.install({
				'config': {
					'artifactId': options.artifactIdPrefix + getName(),
					'buildDir': 'maven-dist',
					'finalName': getFinalName(snapshotConfig),
					'groupId': 'com.liferay.webjars',
					'type': 'jar',
					'version': getVersion(snapshotConfig)
				}
		}));
	});

	gulp.task('prepare-maven-artifact', function() {
		return gulp.src(options.artifactSrc)
			.pipe(gulp.dest(
				path.join('maven-dist/META-INF/resources/webjars', getName(), getVersion())
		));
	});

	gulp.task('publish-maven-artifact', function() {
		return gulp.src('.')
			.pipe(maven.deploy({
				'config': {
					'artifactId': options.artifactIdPrefix + getName(),
					'buildDir': 'maven-dist',
					'finalName': getFinalName(),
					'groupId': 'com.liferay.webjars',
					'type': 'jar',
					'version': getVersion(),
					'repositories': options.repositories.releases
				}
		}));
	});

	gulp.task('publish-maven-snapshot', function() {
		var snapshotConfig = { snapshot: true };

		return gulp.src('.')
			.pipe(maven.deploy({
				'config': {
					'artifactId': options.artifactIdPrefix + getName(),
					'buildDir': 'maven-dist',
					'finalName': getFinalName(snapshotConfig),
					'groupId': 'com.liferay.webjars',
					'type': 'jar',
					'version': getVersion(snapshotConfig),
					'repositories': options.repositories.snapshots
				}
		}));
	});

	gulp.task('maven-install', function(done) {
		runSequence('init-maven-install', 'prepare-maven-install', 'install-maven-release', 'clean-maven-dist', done);
	});

	gulp.task('maven-publish', function(done) {
		runSequence('prepare-maven-artifact', 'publish-maven-artifact', 'clean-maven-dist', done);
	});

	gulp.task('maven-publish-snapshot', function(done) {
		runSequence('prepare-maven-snapshot', 'publish-maven-snapshot', 'clean-maven-dist', done);
	});

	return gulp;
};

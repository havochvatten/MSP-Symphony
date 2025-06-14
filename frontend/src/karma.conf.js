// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      verboseDeprecations: true,
      // jasmine: {
      //   timeoutInterval: 10000   // useful setting: jasmine.DEFAULT_TIMEOUT_INTERVAL (default: 5000)
      // }
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../coverage/symphony-fe'),
      reporters: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'ChromeCI'],
    singleRun: false,
    restartOnFileChange: true,
    customLaunchers: {
      ChromeCI: {
        base: 'ChromiumHeadless',
        flags: ['--no-sandbox']
      }
    }
  });
};

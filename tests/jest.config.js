const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  'transformIgnorePatterns': [
    '/node_modules/(?!antd/es|rc-tooltip|rc-util|rc-pagination|rc-calendar/es)',
    '/output/'
  ],
  'coveragePathIgnorePatterns': [
    '/node_modules/',
    '/output/'
  ],
  'testPathIgnorePatterns': [
    '/node_modules/',
    '/output/'
  ],
  'testRegex': 'tests\\/.*(\\.|/)(test|spec)\\.jsx?$',
  'moduleNameMapper': {
    '\\.(css|less|sass|scss)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@component(.*)$': '<rootDir>/src/public/component$1',
    '^@util(.*)$': '<rootDir>/src/public/util$1',
    '^@hoc(.*)$': '<rootDir>/src/public/hoc$1',
    '^@container(.*)$': '<rootDir>/src/public/container$1'
  },
  'reporters': [
    'default',
    // ['./node_modules/jest-html-reporter', {
    //   'pageTitle': 'Test Report',
    //   'outputPath': 'test-report/index.html', // 报表输出目录
    //   'includeFailureMsg': true
    // }]
    ['<rootDir>/node_modules/byted-easy-api/JestApiReporter.js',{ 'open': true, 'clean': true }]
  ]
};
